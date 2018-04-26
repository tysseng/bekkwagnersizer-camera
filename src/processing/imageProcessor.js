import jsfeat from 'jsfeat';
import 'floodfill';
import { correctPerspective, getPerspectiveCorrectionTransform } from "./perspectiveFixer";
import { findBoundingBox, findBoundingCorners } from './boundingDetection'
import {
  detectCornersUsingBlurredImage,
  detectCornersUsingDownscaledImage,
  detectCornersUsingOriginalImage
} from "./cornerDetection";
import logger from '../logging/logger';
import { detectLines } from "./lineDetection";

const padding = 20;

const debug = {
  drawSheetCorners: false,
  drawBoundingBox: true,
  drawAllCorners: true,
};

const drawImageOnCanvas = (ctx) => {
  const img = document.getElementById("sourceImage");
  ctx.drawImage(img, 0, 0);
};

const writeToGrayscaleImageData = (image_data, img) => {
  const data_u32 = new Uint32Array(image_data.data.buffer);
  const alpha = (0xff << 24);

  let i = img.cols * img.rows, pix = 0;
  while (--i >= 0) {
    pix = img.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
};


const drawBoundingBox = (ctx, bb) => {
  const x = bb.topLeft.x;
  const y = bb.topLeft.y;
  const height = bb.bottomRight.y - y;
  const width = bb.bottomRight.x - x;

  ctx.beginPath();
  ctx.lineWidth = '1';
  ctx.strokeStyle = 'red';
  ctx.rect(x, y, width, height);
  ctx.stroke();
};

const drawPoint = (ctx, point, color) => {
  const radius = 6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.stroke();
};

const drawCorners = (ctx, orderedCorners) => {
  // draw in clockwise order
  drawPoint(ctx, orderedCorners.topLeft, 'red');
  drawPoint(ctx, orderedCorners.topRight, 'green');
  drawPoint(ctx, orderedCorners.bottomRight, 'yellow');
  drawPoint(ctx, orderedCorners.bottomLeft, 'blue');
};

const drawAllCorners = (ctx, corners) => {
  // draw in clockwise order
  corners.forEach(corner => drawPoint(ctx, corner, 'red'))
};

const floodFillOutline = (ctx) => {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fillFlood(padding * 2, padding * 2, 32);
};

const distToWhite = (r, g, b) => {
  const rDist = 255 - r;
  const gDist = 255 - g;
  const bDist = 255 - b;

  const rgVector = Math.sqrt(rDist * rDist + gDist * gDist);
  return Math.sqrt(rgVector * rgVector + bDist * bDist);
};

const findWhitePoint = (ctx, width, height) => {
  let r;
  let g;
  let b;
  let minimalDist = Number.MAX_SAFE_INTEGER;
  let index;

  const data = ctx.getImageData(padding, padding, width - padding * 2, height - padding * 2).data;
  for (let i = 0; i < data.length; i += 4) {
    const dist = distToWhite(data[i], data[i + 1], data[i + 2]);
    if (dist < minimalDist) {
      minimalDist = dist;
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
      index = i;
    }
  }
  //TODO: these are most likely not correct.
  const x = (index / 4) % width;
  const y = Math.floor((index / 4) / height);
  console.log('max white is', { r, g, b, x, y });
  //drawPoint(ctx, { x, y }, 'red');
  return { r, g, b, x, y, index }
};

const adjustColor = (original, wp) => {
  // shift colors upwards to prevent stretching from breaking flow fill.
  const adjusted = original + (255 - wp);
  if (adjusted > 255) {
    return 255;
  }
  return adjusted;
};

const adjustWhitePoint = (wp, ctx, target, width, height) => {
  const image_data = ctx.getImageData(padding, padding, width - padding * 2, height - padding * 2);
  const data = image_data.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = adjustColor(data[i], wp.r);
    data[i + 1] = adjustColor(data[i + 1], wp.g);
    data[i + 2] = adjustColor(data[i + 2], wp.b);
  }
  target.putImageData(image_data, padding, padding);
};

const detectSheetCorners = (ctx, image, width, height) => {
  //const corners = detectCornersUsingDownscaledImage(image, width, height);
  const corners = detectCornersUsingBlurredImage(image, width, height);
  //const corners = detectCornersUsingOriginalImage(image, width, height);
  const boundingBox = findBoundingBox(corners);
  const orderedCorners = findBoundingCorners(boundingBox, corners);
  console.log('corners', corners);
  console.log('bounding box', boundingBox);
  //console.log('orderedCorners', orderedCorners);
  if(debug.drawBoundingBox) drawBoundingBox(ctx, boundingBox);
  //drawCorners(ctx, orderedCorners);
  if(debug.drawSheetCorners) drawAllCorners(ctx, corners);
  return orderedCorners;
};

const getGrayscaleImage = (ctx, width, height) => {
  const image_data = ctx.getImageData(0, 0, width, height);
  const grayImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(image_data.data, width, height, grayImage);
  writeToGrayscaleImageData(image_data, grayImage);
  ctx.putImageData(image_data, 0, 0);
  return grayImage;
};

const process = (ctx, targetCtx, targetCtx2, width, height) => {
  drawImageOnCanvas(ctx);
  const grayImage = getGrayscaleImage(ctx, width, height);
  let orderedCorners;
  try {
    logger.info('First corer detect try');
    orderedCorners = detectSheetCorners(ctx, grayImage, width, height);
  } catch (error) {
    logger.info('Second corer detect try');
    // if fails, rotate and try again. This seems like a good rotation, though we get some false
    // corners close to the edge, so we need to ignore those. Drawing on top of the existing image
    // works nicely as long as the sheet is not too close to the edge.
    ctx.rotate(0.05);
    drawImageOnCanvas(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const grayImage2 = getGrayscaleImage(ctx, width, height);

    // TODO: Test tansforming the corners back to the original image instead of re-rotating the
    // image (though this requires a copy of the original canvas, which we have NOT kept because
    // we wanted to draw on the original to keep the background color nice after rotation
    orderedCorners = detectSheetCorners(ctx, grayImage2, width, height);
  }

  const transform = getPerspectiveCorrectionTransform(orderedCorners, width, height);
  correctPerspective(ctx, targetCtx, transform, width, height);

  // Detect lines to prepare for flood fill
  // TODO: Remove tiny islands
  const grayImage3 = getGrayscaleImage(targetCtx, width, height);
  const imageWithDilutedLines = detectLines(grayImage3, width, height);
  const lineImageData = targetCtx2.getImageData(0, 0, width, height);
  writeToGrayscaleImageData(lineImageData, imageWithDilutedLines);
  targetCtx2.putImageData(lineImageData, 0, 0);

  //const whitePoint = findWhitePoint(targetCtx, width, height);
  //adjustWhitePoint(whitePoint, targetCtx, targetCtx2, width, height);
  // check https://github.com/licson0729/CanvasEffects
  // eller test histogram på alle kanaler. Se også https://en.wikipedia.org/wiki/Histogram_equalization


  // TODO: slightly crop outlines to make sure edges are straight
  // TODO: Remove any logo, barcode, marker etc.
  // TODO: adjust white balance to get a white paper to be able to expand:
  // TODO: expand outline to make floodfill work even if someone draws to the edge of the paper
  floodFillOutline(targetCtx2);
};

export default (ctx, targetCtx, targetCtx2, width, height) => {
  process(ctx, targetCtx, targetCtx2, width, height);
}
