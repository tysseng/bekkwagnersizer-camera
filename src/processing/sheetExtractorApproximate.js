// This extractor requires the camera to be placed exactly over the center of the
// capture area. It does not correct perspective, it detects corners, rotates the sheet and scales
// it to fill the whole context.

import { timed } from "../utils/timer";
import { drawImageRotatedAroundCenter } from "./draw";
import { isLogoInCorrectCorner } from './logoDetection';
import config from '../config';
import { distance } from './trigonometry';
import { mapToJsFeatImageData, rotateGrayscale180 } from './jsfeat.utils';
import { copyCanvas, rotateColor180 } from "./context.utils";
import logger from '../utils/logger';

const detectRotation = (sheetCorners) => {
  const { topLeft, topRight, bottomLeft } = sheetCorners;
  const x = topRight.x - topLeft.x;
  const y = topRight.y - topLeft.y;

  const angle = Math.atan(y / x);

  const topLength = distance(topLeft, topRight);
  const leftLength = distance(topLeft, bottomLeft);

  if (topLength > leftLength) {
    const correctedAngle = angle + Math.PI / 2;
    logger.info("Image is rotated", correctedAngle, (360 * correctedAngle) / (2 * Math.PI), x, y);
    // sheet is placed in landscape mode, add 90 degrees to rotation.
    return angle + Math.PI / 2;
  } else {
    logger.info("Image is rotated", angle, (360 * angle) / (2 * Math.PI), x, y);
    return angle;
  }
};

const rotateCorner = (corner, width, height, angle) => {
  const centerX = corner.x - (width / 2);
  const centerY = corner.y - (height / 2);

  const newX = (centerX * Math.cos(angle)) - (centerY * Math.sin(angle));
  const newY = (centerY * Math.cos(angle)) + (centerX * Math.sin(angle));

  return { x: Math.round(newX + (width / 2)), y: Math.round(newY + (height / 2)) };
};

const rotateSheetCorners = (sheetCorners, width, height, angle) => {
  const { topLeft, topRight, bottomLeft, bottomRight } = sheetCorners;
  return {
    topLeft: rotateCorner(topLeft, width, height, angle),
    topRight: rotateCorner(topRight, width, height, angle),
    bottomLeft: rotateCorner(bottomLeft, width, height, angle),
    bottomRight: rotateCorner(bottomRight, width, height, angle)
  }
};

const getSheetInfo = (sheetCorners) => {
  const { topLeft, topRight, bottomLeft } = sheetCorners;
  const width = topRight.x - topLeft.x;
  const height = bottomLeft.y - topLeft.y;
  const x = topLeft.x;
  const y = topLeft.y;

  return { x, y, width, height }
};

const resizeSheet = (sourceCanvas, targetCtx, sheetInfo, targetSize) => {
  const { x, y, height, width } = sheetInfo;
  targetCtx.drawImage(
    sourceCanvas,
    x, y, width, height, // from
    0, 0, targetSize.width, targetSize.height // to
  );
};

// NB: canvas, input and output ctx'es are mutated.
export const extractSheetUsingRotationAndScaling = (
  sheetCorners,
  width,
  height,
  prerotation, // if image has been rotated to detect corners, subtract this.
  canvases,

) => {

  const rotatedCanvas = canvases.correctedSheetRotation.canvas;
  const rotatedCtx = canvases.correctedSheetRotation.ctx;
  const resizedCtx = canvases.correctedSheetScaling.ctx;
  const flippedCtx = canvases.correctedSheetFlipping.ctx;

  const rotation = detectRotation(sheetCorners);

  // Rotate around center to align with canvas outline
  if (rotation !== 0) {
    // as we redraw the picture based on the initial (unrotated) frame, we need to subtract
    // any pre-rotation done during corner detection.
    timed(() => drawImageRotatedAroundCenter(rotatedCtx, width, height, -prerotation - rotation), 'rotating sheet');
    sheetCorners = timed(() => rotateSheetCorners(sheetCorners, width, height, -rotation), 'rotating corners');
  }

  const sheetInfo = getSheetInfo(sheetCorners);
  timed(() => resizeSheet(rotatedCanvas, resizedCtx, sheetInfo, {
    width: config.outputWidth,
    height: config.outputHeight
  }), 'resizing');

  // for debugging
  console.log(canvases)
  copyCanvas(canvases.correctedSheetScaling, canvases.correctedSheetFlipping);

  // Detect lines to prepare for flood fill
  // TODO: Remove tiny islands
  const grayPerspectiveCorrectedImage = mapToJsFeatImageData(resizedCtx, width, height);

  if (!isLogoInCorrectCorner(grayPerspectiveCorrectedImage, width, height)) {
    timed(() => rotateGrayscale180(grayPerspectiveCorrectedImage), 'rotating image 180 degrees');
    const imageData = flippedCtx.getImageData(0, 0, width, height);
    timed(() => rotateColor180(imageData.data, height * width * 4), 'rotating color image');
    flippedCtx.putImageData(imageData, 0, 0);
  }
  return grayPerspectiveCorrectedImage;
};