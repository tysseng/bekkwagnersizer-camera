// @flow
// This extractor works with camera placements that are slightly off center. It corrects the
// perspective but only detects corners up to a certain point.
import { correctPerspective } from "./perspectiveFixer";
import { timed } from "../utils/timer";
import { distance, rotatePointAroundCenter } from '../utils/trigonometry';
import { mapToJsFeatImageData } from '../utils/gfx/jsfeat.utils';
import { correctSheetOrientation } from "./flipDetection";
import type { Container, SheetCorners, SheetParams } from "../types";

const correctOrientation = (sheetCorners: SheetCorners) => {
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

const rotateSheetCorners = (
  sheetCorners: SheetCorners,
  width: number,
  height: number,
  angle: number
) => {
  const { topLeft, topRight, bottomLeft, bottomRight } = sheetCorners;
  return {
    topLeft: rotatePointAroundCenter(topLeft, width, height, angle),
    topRight: rotatePointAroundCenter(topRight, width, height, angle),
    bottomLeft: rotatePointAroundCenter(bottomLeft, width, height, angle),
    bottomRight: rotatePointAroundCenter(bottomRight, width, height, angle)
  }
};

export const extractSheet = (source: Container, sheetParams: SheetParams) => {
  const { sheetCorners, prerotation } = sheetParams;
  const frameWidth = source.dimensions.width;
  const frameHeight = source.dimensions.height;

  // TODO: this should probably be done in sheetDetection.
  // remove prerotation to get points that match the original image
  const rotatedCorners = timed(() => rotateSheetCorners(sheetCorners, frameWidth, frameHeight, prerotation), 'rotating corners');

  // adjust landscape/portrait. We want a portrait view.
  const reorientatedCorners = correctOrientation(rotatedCorners);

  const correctedContainer = timed(() => correctPerspective(source, reorientatedCorners), 'correct perspective');

  // Detect lines to prepare for flood fill
  // TODO: Remove tiny islands
  correctedContainer.gray = mapToJsFeatImageData(correctedContainer);
  return correctSheetOrientation(correctedContainer);
};