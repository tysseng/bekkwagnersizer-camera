// @flow
// detect if sheet has been placed on the scanner upside down (rotated 180 degrees)

import config from "../config";
import { isLogoInCorrectCorner } from "./logo";
import { rotateGrayscale180 } from "../utils/gfx/jsfeat.utils";
import { copyCanvas, rotateColor180 } from "../utils/gfx/canvas.utils";
import { timed } from "../utils/timer";
import { isBitCodeInCorrectCorner, isBitCodeInWrongCorner } from "./bitCode";
import { flipDetectionMethods } from "./flipDetectionMethods";
import { getNextProcessingContainer } from "../canvases";
import type { Container, JsFeatImage } from "../types";

const rotate180 = (
  source: Container,
  target: Container,
  grayImage: JsFeatImage,
) => {
  const sourceCtx = source.ctx;
  const { width, height } = source.size;
  const imageData = sourceCtx.getImageData(0, 0, width, height);
  // TODO: NON-DESTRUCTIVE rotation of gray image
  timed(() => rotateGrayscale180(grayImage), 'rotating image 180 degrees');
  timed(() => rotateColor180(imageData.data, width * height * 4), 'rotating color image');
  target.ctx.putImageData(imageData, 0, 0);
  target.gray = grayImage;
};

export const correctSheetOrientation = (source: Container): Container => {

  const grayImage = source.gray;
  if(grayImage == null){
    throw Error('Gray scale image is missing, it really shouldnt be you know.')
  }
  const {width: sheetWidth, height: sheetHeight} = source.size;

  const target = getNextProcessingContainer(source.size, 'Correct sheet orientation');

  if (config.flipCorrection === flipDetectionMethods.LOGO) {
    if (!isLogoInCorrectCorner(grayImage, sheetWidth, sheetHeight)) {
      rotate180(source, target, grayImage);
    } else {
      copyCanvas(source, target);
    }
  } else if (config.flipCorrection === flipDetectionMethods.BITCODE) {
    // as bitcode is more sensitive than logo detection, we want to be as sure as possible that
    // it has been placed wrong before rotating, so we check both positive and negative confirmation
    if (
      !isBitCodeInCorrectCorner(source) &&
      isBitCodeInWrongCorner(source)
    ) {
      rotate180(source, target, grayImage);
    } else {
      copyCanvas(source, target);
    }
  } else {
    copyCanvas(source, target);
  }
  return target;
};