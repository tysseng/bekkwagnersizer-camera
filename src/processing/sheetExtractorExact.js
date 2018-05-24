// This extractor works with camera placements that are slightly off center. It corrects the
// perspective but only detects corners up to a certain point.
import { correctPerspective } from "./perspectiveFixer";
import { timed } from "../utils/timer";
import { distance, rotatePointAroundCenter } from '../utils/trigonometry';
import { mapToJsFeatImageData } from '../utils/gfx/jsfeat.utils';
import { correctSheetOrientation } from "./flipDetection";

const correctOrientation = (sheetCorners) => {
  const { topLeft, topRight, bottomLeft, bottomRight } = sheetCorners;

  const topLength = distance(topLeft, topRight);
  const leftLength = distance(topLeft, bottomLeft);

  if (topLength > leftLength) {
    // sheet is placed in landscape mode, must rotate 90 degrees
    return {
      topLeft: bottomLeft,
      topRight: topLeft,
      bottomRight: topRight,
      bottomLeft: bottomRight,
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

  correctSheetOrientation(canvases, grayPerspectiveCorrectedImage, sheetWidth, sheetHeight);

  return grayPerspectiveCorrectedImage;
};