// @flow
// If sheet is present, some of the pixels along the center line should be non-black.
// This is a fast check before trying to find the corners.
// TODO: Sheet presence og occlusionDetection er veldig like!
import { getPointColorFromImageData } from "../utils/gfx/context.utils";
import logger from "../utils/logger";
import type { Container, Point } from "../types";

// fast sheet detection
const initialSamples = [];
const sheetColorDifferenceThreshold = 100;
const changedPixNeededForSheet = 10;

const getColorAt = (data: Uint8ClampedArray, point: Point, width: number): number => {
  const color = getPointColorFromImageData(data, point, width);
  return color.r + color.g + color.b;
};

export const captureOriginalSheetPresenceLine = (container: Container) => {
  const ctx = container.ctx;
  const { width, height } = container.dimensions;
  const data = ctx.getImageData(0, 0, width, height).data; // TODO: Possible to extract only a single row?

  let row = Math.floor(height / 2);
  for (let col = 0; col < width; col++) {
    initialSamples[col] = getColorAt(data, {x: col, y: row}, width);
  }

  logger.info('original sheet presence line captured');
};

const changeIsAboveThreshold = (originalColor: number = 0, newColor: number): number => {
  const diff = newColor - originalColor; // new color must be lighter than previous one
  if(diff > sheetColorDifferenceThreshold){
    return 1;
  }
  return 0;
};

// If sheet is present, some of the pixels along the center line should be non-black.
// This is a fast check before trying to find the corners.
export const isSheetPresent = (videoFrameContainer: Container): boolean => {
  const ctx = videoFrameContainer.ctx;
  const { width, height } = videoFrameContainer.dimensions;
  const data = ctx.getImageData(0, 0, width, height).data; // TODO: Possible to extract only a single row?

  let pixelCount = 0;
  let row = Math.floor(height / 2);
  for (let col = 0; col < width; col++) {
    const originalColor = initialSamples[col];
    const newColor = getColorAt(data, {x: col, y: row}, width);

    if (changeIsAboveThreshold(originalColor, newColor)) pixelCount++;
    if (pixelCount >= changedPixNeededForSheet) {
      return true;
    }
  }
  logger.info(`Could not find enough changed pixels (found ${pixelCount}), sheet is probably not present`);
  return false;
};
