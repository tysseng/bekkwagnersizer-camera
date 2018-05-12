import config from "../config";
import { drawSquareAroundPoint } from "./jsfeat.utils";
import { drawJsFeatImageOnContext } from "./draw";
import logger from "../utils/logger";

const paddingAroundBitPosition = 19;
const blackThreshold = 100;
const blackPixNeededFor1 = 30;

const getNumberOfPixelsBelowThreshold = (image, imageWidth, padding, x, y) => {
  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      if(image.data[row * imageWidth + col] < blackThreshold) pixelCount++;
    }
  }
  return pixelCount;
};

const readBit = (pos, image, width) => {
  drawSquareAroundPoint(image, width, paddingAroundBitPosition+1, pos.x, pos.y, 0);
  const one = getNumberOfPixelsBelowThreshold(image, width, paddingAroundBitPosition, pos.x, pos.y) >= blackPixNeededFor1;
  return one ? '1' : '0';
};

export const readBitCode = (image, width, height, canvases) => {
  const bits = config.bitPositions.map(pos => readBit(pos, image, width));
  const number = parseInt(bits.join(''), 2);
  drawJsFeatImageOnContext(image, canvases.bitCodeDetection.ctx, width, height);
  logger.info('Detected bits');
  logger.info(bits);
  logger.info('Sheet number: ' + number);
  return number;
};