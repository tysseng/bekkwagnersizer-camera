// If sheet is present, some of the pixels along the center line should be non-black.
// This is a fast check before trying to find the corners.
import { getColorFromImageData } from "../utils/gfx/context.utils";
import logger from "../utils/logger";

// fast sheet detection
const initialSamples = [];
const sheetColorDifferenceThreshold = 100;
const changedPixNeededForSheet = 10;


export const isSheetPresentBW = (image, width, height) => {
  const sheetColorThreshold = 100;
  const whitePixNeededForSheet = 10;

  let pixelCount = 0;
  let row = Math.floor(height / 2);
  for (let col = 0; col < width; col++) {
    if (image.data[row * width + col] > sheetColorThreshold) pixelCount++;
    if (pixelCount >= whitePixNeededForSheet) {
      return true;
    }
  }
  logger.info(`Could not find enough white pixels (found ${pixelCount}), sheet is probably not present`);
  return false;
};

const getColorAt = (data, point, width) => {
  const color = getColorFromImageData(data, point, width);
  return color.r + color.g + color.b;
};

export const captureOriginalSheetPresenceLine = (canvases) => {
  const ctx = canvases.baselineVideoFrame.ctx;
  const { width, height } = canvases.baselineVideoFrame.dimensions;
  const data = ctx.getImageData(0, 0, width, height).data; // TODO: Possible to extract only a single row?

  let row = Math.floor(height / 2);
  for (let col = 0; col < width; col++) {
    initialSamples[col] = getColorAt(data, {x: col, y: row}, width);
  }

  logger.info('original sheet presence line captured');
};

const changeIsAboveThreshold = (originalColor = 0, newColor) => {
  const diff = newColor - originalColor; // new color must be lighter than previous one
  if(diff > sheetColorDifferenceThreshold){
    return 1;
  }
  return 0;
};

// If sheet is present, some of the pixels along the center line should be non-black.
// This is a fast check before trying to find the corners.
export const isSheetPresent = (canvases) => {
  const ctx = canvases.videoFrame.ctx;
  const { width, height } = canvases.videoFrame.dimensions;
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
