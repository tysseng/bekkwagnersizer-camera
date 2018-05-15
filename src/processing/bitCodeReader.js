import config from "../config";
import { drawSquareAroundPoint } from "./jsfeat.utils";
import { drawJsFeatImageOnContext } from "./draw";
import logger from "../utils/logger";

const paddingAroundBitPosition = config.bitPositionPadding;
const blackThreshold = 100;
const blackPixNeededFor1 = 30;

const bit = (image, imageWidth, padding, x, y) => {
  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      if(image.data[row * imageWidth + col] < blackThreshold) pixelCount++;
      if(pixelCount >= blackPixNeededFor1){
        return '1';
      }
    }
  }
  return '0';
};

const removeBitDot = (ctx, pos, padding) => {
  const {x, y} = pos;
  ctx.beginPath();
  ctx.fillRect(x-padding, y-padding, 2 * padding, 2* padding);
  ctx.stroke();
};

export const removeBitDots = (ctx) => {
  config.bitPositions.forEach(pos => removeBitDot(ctx, pos, paddingAroundBitPosition + 4));
};

const readBit = (pos, image, width) => {
  drawSquareAroundPoint(image, width, paddingAroundBitPosition+1, pos.x, pos.y, 0);
  return bit(image, width, paddingAroundBitPosition, pos.x, pos.y);
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