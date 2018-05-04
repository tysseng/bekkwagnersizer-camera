// This extractor works with camera placements that are slightly off center. It corrects the
// perspective but only detects corners up to a certain point.

import { correctPerspective } from "./perspectiveFixer";
import { timed } from "../utils/timer";
import { isLogoInCorrectCorner } from './logoDetection';
import { distance } from './trigonometry';
import { mapToJsFeatImageData, rotateGrayscale180 } from './jsfeat.utils';
import { rotateColor180 } from "./context.utils";

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

const extractSheetUsingPerspectiveTransformation = (
  sheetCorners, ctx, sheetCtx, width, height
) => {
  // adjust landscape/portrait. We want a portrait view.
  sheetCorners = correctOrientation(sheetCorners, ctx, width, height);

  // TODO: This is a VERY expensive operation (approx 400ms, 1/3 of the total time). Check if
  // we can get away with rotate and scale. This requires a better calibration of the camera's
  // position to the table though
  timed(() => correctPerspective(ctx, sheetCtx, width, height, sheetCorners), 'correct perspective');

  // Detect lines to prepare for flood fill
  // TODO: Remove tiny islands
  const grayPerspectiveCorrectedImage = mapToJsFeatImageData(sheetCtx, width, height);

  if (!isLogoInCorrectCorner(grayPerspectiveCorrectedImage, width, height)) {
    timed(() => rotateGrayscale180(grayPerspectiveCorrectedImage), 'rotating image 180 degrees');
    const imageData = sheetCtx.getImageData(0, 0, width, height);
    timed(() => rotateColor180(imageData.data, height * width * 4), 'rotating color image');
    sheetCtx.putImageData(imageData, 0, 0);
  }

  return grayPerspectiveCorrectedImage;
};