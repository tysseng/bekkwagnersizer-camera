import config from "../config";
import { drawSquareAroundPoint } from "../utils/gfx/jsfeat.utils";
import { drawJsFeatImageOnContext } from "../utils/gfx/draw";
import logger from "../utils/logger";

const paddingAroundBitPosition = config.bitPositionPadding;
const blackThreshold = 100;
const blackPixNeededFor1 = 30;

const bit = (image, imageWidth, padding, x, y) => {
  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      if (image.data[row * imageWidth + col] < blackThreshold) pixelCount++;
      if (pixelCount >= blackPixNeededFor1) {
        return '1';
      }
    }
  }
  return '0';
};

const removeBitDot = (ctx, pos, padding) => {
  const { x, y } = pos;
  ctx.beginPath();
  ctx.fillRect(x - padding, y - padding, 2 * padding, 2 * padding);
  ctx.stroke();
};

export const removeBitDots = (ctx) => {
  config.bitPositions.forEach(pos => removeBitDot(ctx, pos, paddingAroundBitPosition + 4));
};

const readBit = (pos, image, width, draw) => {
  if (draw) drawSquareAroundPoint(image, width, paddingAroundBitPosition + 1, pos.x, pos.y, 0);
  return bit(image, width, paddingAroundBitPosition, pos.x, pos.y);
};

export const readBitCode = (image, width, height, canvases, draw = true, rotate180 = false) => {
  const bits = config
    .bitPositions
    .map(pos => {
      if (rotate180) {
        return { x: width - pos.x, y: height - pos.y };
      } else {
        return pos;
      }
    })
    .map(pos => readBit(pos, image, width, draw));
  const number = parseInt(bits.join(''), 2);
  if (draw) drawJsFeatImageOnContext(image, canvases.bitCodeDetection.ctx, width, height);
  logger.info('Detected bits');
  logger.info(bits);
  logger.info('Sheet number: ' + number);
  return number;
};

export const isBitCodeInCorrectCorner = (canvases, image, width, height) => {
  const result = readBitCode(image, width, height, canvases, false) > 0;
  if(result) {
    logger.info('bitcode is in correct corner');
  } else {
    logger.info('bitcode is not in correct corner');
  }
  return result;
};

export const isBitCodeInWrongCorner = (canvases, image, width, height) => {
  const result = readBitCode(image, width, height, canvases, false, true) > 0;
  if(result) {
    logger.info('bitcode is in wrong corner');
  } else {
    logger.info('bitcode is not in wrong corner');
  }
  return result;
};