import nearest from 'nearest-color';
import config from "../config";
import logger from "../utils/logger";
import { copyCanvas } from "../utils/gfx/context.utils";
import { drawBox } from "../utils/gfx/draw";
import { photoColors } from "./pushwagnerColorMaps";

const paddingAroundBitPosition = config.bitPositionPadding;
const pixelsNeededFor1 = 30;

const bit = (sourceContainer, imageWidth, padding, x, y) => {
  const { width, height } = sourceContainer.dimensions;
  const imageData = sourceContainer.ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const colorsInPhoto = {
    white: photoColors.white,
    dotColor: photoColors.pink,
    black: photoColors.black,
  };

  const nearestPhotoColor = nearest.from(colorsInPhoto);

  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      const i = (row * width + col) * 4;

      // converts pixels to a predefined color to ignore black and only read dot color
      const oldColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
      const isDotColor = nearestPhotoColor(oldColor).value === colorsInPhoto.dotColor;
      if(isDotColor){
        //console.log(oldColor, nearestPhotoColor(oldColor).rgb);
      }
      if (isDotColor) pixelCount++;
      if (pixelCount >= pixelsNeededFor1) {
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

const readBit = (pos, sourceContainer, width) => {
  return bit(sourceContainer, width, paddingAroundBitPosition, pos.x, pos.y);
};

const drawBitOutline = (pos, sourceContainer) => {
    const padding = paddingAroundBitPosition;
    drawBox(
      sourceContainer.ctx,
      { x: pos.x - (padding + 1), y: pos.y - (padding + 1) },
      { x: pos.x + (padding + 1), y: pos.y + (padding + 1) },
    );
};

export const readBitCode = (
  sourceContainer, width, height, canvases, draw = true, rotate180 = false) => {
  const bitPositions = config
    .bitPositions
    .map(pos => {
      if (rotate180) {
        return { x: width - pos.x, y: height - pos.y };
      } else {
        return pos;
      }
    });

  const bits = bitPositions.map(pos => readBit(pos, sourceContainer, width, draw));
  if(draw) bitPositions.forEach((pos, index) => {
    if(bits[index] === '1') drawBitOutline(pos, sourceContainer);
  });

  const number = parseInt(bits.join(''), 2);
  if (draw) copyCanvas(sourceContainer, canvases.bitCodeDetection);
  logger.info('Detected bits');
  logger.info(bits);
  logger.info('Sheet number: ' + number);
  return number;
};

export const isBitCodeInCorrectCorner = (canvases, sourceContainer, width, height) => {
  const result = readBitCode(sourceContainer, width, height, canvases, false) > 0;
  if (result) {
    logger.info('bitcode is in correct corner');
  } else {
    logger.info('bitcode is not in correct corner');
  }
  return result;
};

export const isBitCodeInWrongCorner = (canvases, sourceContainer, width, height) => {
  const result = readBitCode(sourceContainer, width, height, canvases, false, true) > 0;
  if (result) {
    logger.info('bitcode is in wrong corner');
  } else {
    logger.info('bitcode is not in wrong corner');
  }
  return result;
};