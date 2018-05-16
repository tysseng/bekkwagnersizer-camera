// This extractor works with camera placements that are slightly off center. It corrects the
// perspective but only detects corners up to a certain point.

import { correctPerspective } from "./perspectiveFixer";
import { timed } from "../utils/timer";
import { isLogoInCorrectCorner } from './logoDetection';
import { distance, rotatePointAroundCenter } from './trigonometry';
import { mapToJsFeatImageData, rotateGrayscale180 } from './jsfeat.utils';
import { copyCanvas, rotateColor180 } from "./context.utils";

const correctOrientation = (sheetCorners) => {
  const { topLeft, topRight, bottomLeft, bottomRight } = sheetCorners;

  const topLength = distance(topLeft, topRight);
  const leftLength = distance(topLeft, bottomLeft);

  if (topLength > leftLength) {
    // sheet is placed in landscape mode, must rotate 90 degrees
    return {
      topLeft: bottomRight,
      topRight: topLeft,
      bottomRight: topRight,
      bottomLeft: bottomLeft,
    }
  } else {
    return sheetCorners;
  }
};

const rotateSheetCorners = (sheetCorners, width, height, angle) => {
  const { topLeft, topRight, bottomLeft, bottomRight } = sheetCorners;
  return {
    topLeft: rotatePointAroundCenter(topLeft, width, height, angle),
    topRight: rotatePointAroundCenter(topRight, width, height, angle),
    bottomLeft: rotatePointAroundCenter(bottomLeft, width, height, angle),
    bottomRight: rotatePointAroundCenter(bottomRight, width, height, angle)
  }
};

export const extractSheetUsingPerspectiveTransformation = (
  sheetCorners,
  frameWidth,
  frameHeight,
  sheetWidth,
  sheetHeight,
  prerotation,
  canvases,
) => {

  const imageCtx = canvases.videoFrame.ctx;
  const correctedCtx = canvases.correctedSheetScaling.ctx;
  const flippedCtx = canvases.correctedSheetFlipping.ctx;

  // TODO: this should probably be done in sheetDetection.
  // remove prerotation to get points that match the original image
  sheetCorners = timed(() => rotateSheetCorners(sheetCorners, frameWidth, frameHeight, prerotation), 'rotating corners');

  // adjust landscape/portrait. We want a portrait view.
  sheetCorners = correctOrientation(sheetCorners);

  // TODO: This is a VERY expensive operation (approx 400ms, 1/3 of the total time). Check if
  // we can get away with rotate and scale. This requires a better calibration of the camera's
  // position to the table though
  timed(() => correctPerspective(imageCtx, correctedCtx, sheetWidth, sheetHeight, sheetCorners), 'correct perspective');

  // Detect lines to prepare for flood fill
  // TODO: Remove tiny islands
  const grayPerspectiveCorrectedImage = mapToJsFeatImageData(correctedCtx, sheetWidth, sheetHeight);

  if (!isLogoInCorrectCorner(grayPerspectiveCorrectedImage, sheetWidth, sheetHeight)) {
    timed(() => rotateGrayscale180(grayPerspectiveCorrectedImage), 'rotating image 180 degrees');
    const imageData = correctedCtx.getImageData(0, 0, sheetWidth, sheetHeight);

    timed(() => rotateColor180(imageData.data, sheetHeight * sheetWidth * 4), 'rotating color image');
    flippedCtx.putImageData(imageData, 0, 0);
  } else {
    // for debugging
    copyCanvas(canvases.correctedSheetScaling, canvases.correctedSheetFlipping);
  }

  return grayPerspectiveCorrectedImage;
};