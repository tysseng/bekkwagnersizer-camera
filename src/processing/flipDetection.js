// detect if sheet has been placed on the scanner upside down (rotated 180 degrees)

import config from "../config";
import { isLogoInCorrectCorner } from "./logo";
import { rotateGrayscale180 } from "../utils/gfx/jsfeat.utils";
import { copyCanvas, rotateColor180 } from "../utils/gfx/context.utils";
import { timed } from "../utils/timer";
import { isBitCodeInCorrectCorner, isBitCodeInWrongCorner } from "./bitCode";
import { flipDetectionMethods } from "./flipDetectionMethods";

const rotate180 = (sourceCtx, targetCtx, grayImage, sheetWidth, sheetHeight) => {
  const imageData = sourceCtx.getImageData(0, 0, sheetWidth, sheetHeight);
  timed(() => rotateGrayscale180(grayImage), 'rotating image 180 degrees');
  timed(() => rotateColor180(imageData.data, sheetHeight * sheetWidth * 4), 'rotating color image');
  targetCtx.putImageData(imageData, 0, 0);
};

export const correctSheetOrientation = (canvases, grayImage, sheetWidth, sheetHeight) => {
  const correctedCtx = canvases.correctedSheetScaling.ctx;
  const flippedCtx = canvases.correctedSheetFlipping.ctx;
  if (config.flipCorrection === flipDetectionMethods.LOGO) {
    if (!isLogoInCorrectCorner(grayImage, sheetWidth, sheetHeight)) {
      rotate180(correctedCtx, flippedCtx, grayImage, sheetWidth, sheetHeight);
    } else {
      copyCanvas(canvases.correctedSheetScaling, canvases.correctedSheetFlipping);
    }
  } else if (config.flipCorrection === flipDetectionMethods.BITCODE) {
    // as bitcode is more sensitive than logo detection, we want to be as sure as possible that
    // it has been placed wrong before rotating, so we check both positive and negative confirmation
    if (
      !isBitCodeInCorrectCorner(canvases, grayImage, sheetWidth, sheetHeight) &&
      isBitCodeInWrongCorner(canvases, grayImage, sheetWidth, sheetHeight)
    ) {
      rotate180(correctedCtx, flippedCtx, grayImage, sheetWidth, sheetHeight);
    } else {
      copyCanvas(canvases.correctedSheetScaling, canvases.correctedSheetFlipping);
    }
  } else {
    copyCanvas(canvases.correctedSheetScaling, canvases.correctedSheetFlipping);
  }
};