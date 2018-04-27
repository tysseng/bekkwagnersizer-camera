import jsfeat from 'jsfeat';
import 'floodfill';
import { correctPerspective } from "./perspectiveFixer";

import { detectSheetCorners } from "./cornerDetection";
import { detectAndDiluteLines, subMatrixTouchesMask } from "./lineDetection";
import { timed } from "../utils/timer";
import { drawImageOnCanvas, floodFill } from "./draw";


const writeToGrayscaleImageData = (image_data, img) => {
  const data_u32 = new Uint32Array(image_data.data.buffer);
  const alpha = (0xff << 24);

  let i = img.cols * img.rows, pix = 0;
  while (--i >= 0) {
    pix = img.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
};

const getGrayscaleImage = (ctx, width, height) => {
  return timed(() => {
    const image_data = ctx.getImageData(0, 0, width, height);
    const grayImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
    jsfeat.imgproc.grayscale(image_data.data, width, height, grayImage);
    writeToGrayscaleImageData(image_data, grayImage);
    //ctx.putImageData(image_data, 0, 0);
    return grayImage;
  }, 'get grayscale');
};

const getMonocromeMask = (ctx, width, height) => {
  const maskImage = ctx.getImageData(0, 0, width, height);
  const data = maskImage.data;

  for (let i = 0; i < width * height * 4; i += 4) {
    if (data[i + 3] === 255) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  ctx.putImageData(maskImage, 0, 0);
  const grayImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(maskImage.data, width, height, grayImage);
  return grayImage;
};

// TODO: Faster to do this from a greyscale matrix, not a ctx?
const removeMask = (maskCtx, ctx, width, height) => {
  const mask = maskCtx.getImageData(0, 0, width, height);
  const image = ctx.getImageData(0, 0, width, height);
  const maskData = mask.data;
  const imageData = image.data;

  for (let i = 0; i < width * height * 4; i += 4) {
    if (maskData[i] === 255 && maskData[i + 1] === 255 && maskData[i + 2] === 255) {
      imageData[i + 3] = 0;
    }
  }

  ctx.putImageData(image, 0, 0);
};

const drawImageOnCanvasAndDetectCorners = (ctx, width, height, rotation = 0) => {
  if (rotation !== 0) timed(() => ctx.rotate(rotation), 'rotate');
  drawImageOnCanvas(ctx);
  if (rotation !== 0) ctx.setTransform(1, 0, 0, 1, 0, 0);
  const grayscaledImage = getGrayscaleImage(ctx, width, height);
  return detectSheetCorners(ctx, grayscaledImage, width, height);
};

const erodeMaskWithEdgeDetection = (maskCtx, lineImageData, monocromeMask, width, height) => {

  // erode mask, removing the pixels that were added by diluting the original lines. This works
  // by detecting the new mask outline, which is exactly one dilute distance from the real line. As
  // dilute works in both directions, a second dilute will reclaim the missing pixels without
  // going into the holes that were plugged by the original dilute.
  const maskOutline = timed(() => detectAndDiluteLines(monocromeMask, width, height), 'erode mask');
  writeToGrayscaleImageData(lineImageData, maskOutline);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put eroded line image to mask ctx');
  timed(() => floodFill(maskCtx, 255, 255, 255, 0), 'flood fill mask again');
};

const erodeMask =  (maskCtx, lineImageData, monocromeMask, width, height) => {
  const erosionWidth = 1; // must be same as dilution width;
  const maskColor = 255;
  const erodedMask = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);

  for (let x = erosionWidth; x < width - erosionWidth; x++) {
    for (let y = erosionWidth; y < height - erosionWidth; y++) {
      const color = subMatrixTouchesMask(monocromeMask, x, y, width, maskColor, 1) ? maskColor : 0;
      erodedMask.data[y * width + x] = color;
      // TODO: This can be done directly on the target image.
    }
  }

  writeToGrayscaleImageData(lineImageData, erodedMask);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put eroded line image to mask ctx');
};


const process = (ctx, targetCtx, maskCtx, width, height) => {
  drawImageOnCanvas(ctx);
  let orderedCorners;
  try {
    orderedCorners = drawImageOnCanvasAndDetectCorners(ctx, width, height, 0);
  } catch (error) {

    // if fails, rotate and try again. 0.05 seems like a good rotation, though we get some false
    // corners close to the edge, so we need to ignore those. Drawing on top of the existing image
    // works nicely as long as the sheet is not too close to the edge.
    orderedCorners = drawImageOnCanvasAndDetectCorners(ctx, width, height, 0.05);
    // TODO: Test transforming the corners back to the original image instead of re-rotating the
    // image (though this requires a copy of the original canvas, which we have NOT kept because
    // we wanted to draw on the original to keep the background color nice after rotation
  }

  // TODO: This is a VERY expensive operation (approx 400ms, 1/3 of the total time). Check if
  // we can get away with rotate and scale. This requires a better calibration of the camera's
  // position to the table though
  timed(() => correctPerspective(ctx, targetCtx, width, height, orderedCorners), 'correct perspective');

  // Detect lines to prepare for flood fill
  // TODO: Remove tiny islands
  const grayPerspectiveCorrectedImage = getGrayscaleImage(targetCtx, width, height);
  const imageWithDilutedLines = timed(() => detectAndDiluteLines(
    grayPerspectiveCorrectedImage, width, height
  ), 'detect lines');

  const lineImageData = timed(() => maskCtx.getImageData(0, 0, width, height), 'get image data');
  writeToGrayscaleImageData(lineImageData, imageWithDilutedLines);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put line image to mask ctx');
  timed(() => floodFill(maskCtx, 255, 0, 0, 0.5), 'flood fill mask');

  // turn image monocrome by clearing all pixels that are not part of the mask
  const monocromeMask = timed(() => getMonocromeMask(maskCtx, width, height), 'get monocrome mask');
  //timed(() => erodeMaskWithEdgeDetection(maskCtx, lineImageData, monocromeMask, width, height), 'mask erosion 1');

  // erode mask without flood fill and line detect takes 63ms, the other 200. The result is almost
  // as good.
  timed(() => erodeMask(maskCtx, lineImageData, monocromeMask, width, height), 'mask erosion 2');

  timed(() => removeMask(maskCtx, targetCtx, width, height), 'remove mask');

  // aaaaand once more make monocrome image by keeping transparency black and rest white, this
  // removes all inner lines.
  // use line detection
  // run dilate with black
  // remaining black portions are mask, transfer mask to original bitmap
};

export default (ctx, targetCtx, targetCtx2, width, height) => {
  const startTime = new Date().getTime();
  process(ctx, targetCtx, targetCtx2, width, height);
  const endTime = new Date().getTime();

  console.log('Finished, this took ' + (endTime - startTime) + 'ms', startTime, endTime);
}
