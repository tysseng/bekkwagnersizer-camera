import { timed } from "../utils/timer";
import jsfeat from 'jsfeat';
import { detectLines, subMatrixTouchesMask } from "./lineDetection";
import { mapToCanvasImageData } from "./jsfeat.utils";
import { floodFill } from "./draw";

// TODO: Must be possible to do this faster, directly in a monocrome image
export const getMonocromeMask = (ctx, width, height) => {
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
  const grayImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(maskImage.data, width, height, grayImage);
  return grayImage;
};


// TODO: Faster to do this from a greyscale matrix, not a ctx?
export const removeMask = (maskCtx, ctx, width, height) => {
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

export const erodeMaskWithEdgeDetection = (maskCtx, lineImageData, monocromeMask, width, height) => {

  // erode mask, removing the pixels that were added by diluting the original lines. This works
  // by detecting the new mask outline, which is exactly one dilute distance from the real line. As
  // dilute works in both directions, a second dilute will reclaim the missing pixels without
  // going into the holes that were plugged by the original dilute.
  const maskOutline = timed(() => detectLines(monocromeMask, width, height), 'erode mask');
  mapToCanvasImageData(maskOutline, lineImageData);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put eroded line image to mask ctx');
  timed(() => floodFill(maskCtx, 255, 255, 255, 0), 'flood fill mask again');
};

export const erodeMask = (maskCtx, lineImageData, monocromeMask, width, height) => {
  const erosionWidth = 1; // must be same as dilution width;
  const maskColor = 255;
  const erodedMask = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);

  for (let x = erosionWidth; x < width - erosionWidth; x++) {
    for (let y = erosionWidth; y < height - erosionWidth; y++) {
      const color = subMatrixTouchesMask(monocromeMask, x, y, width, maskColor) ? maskColor : 0;
      erodedMask.data[y * width + x] = color;
      // TODO: This can be done directly on the target image.
    }
  }

  mapToCanvasImageData(erodedMask, lineImageData);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put eroded line image to mask ctx');
};