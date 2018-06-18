// @flow
import nearest from 'nearest-color';
import config from "../config";
import logger from "../utils/logger";
import { copyCanvas } from "../utils/gfx/canvas.utils";
import { drawBox } from "../utils/gfx/draw";
import { getNextProcessingContainer } from "../canvases";
import {
  getBitCodeColorMappings,
  getPhotoColorCodes
} from "../colorizing/colorRepository";
import type {
  BitCodeColorMap,
  Container,
  NearestColorMapper,
  Point
} from "../types";

const pixelsNeededFor1 = 30;

const bit = (
  sourceContainer: Container,
  padding: number,
  pos: Point,
  nearestPhotoColorMapper: NearestColorMapper,
): string => {
  const { x, y, } = pos;
  const { width, height } = sourceContainer.size;
  const imageData = sourceContainer.ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      const i = (row * width + col) * 4;

      // converts pixels to a predefined color to ignore black and only read dot color
      const oldColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
      const isDotColor = nearestPhotoColorMapper(oldColor).name === 'dotColor';

      if (isDotColor) pixelCount++;
      if (pixelCount >= pixelsNeededFor1) {
        return '1';
      }
    }
  }
  return '0';
};

const removeBitDot = (
  ctx: CanvasRenderingContext2D,
  pos: Point,
  padding: number
) => {
  const { x, y } = pos;
  ctx.beginPath();
  ctx.fillRect(x - padding, y - padding, 2 * padding, 2 * padding);
  ctx.stroke();
};

export const removeBitDots = (container: Container) => {
  const ctx = container.ctx;
  config.bitPositions.forEach(pos => removeBitDot(ctx, pos, config.bitPositionPadding + 4));
};

const readBit = (
  pos: Point,
  source: Container,
  nearestPhotoColorMapper: NearestColorMapper,
): string => {
  return bit(
    source, config.bitPositionPadding, pos, nearestPhotoColorMapper
  );
};

const drawBitOutline = (bitPos: Point, target: Container) => {
  const padding = config.bitPositionPadding;
  drawBox(
    target.ctx,
    { x: bitPos.x - (padding + 1), y: bitPos.y - (padding + 1) },
    { x: bitPos.x + (padding + 1), y: bitPos.y + (padding + 1) },
  );
};

const getBitCodePhotoColors = (map: BitCodeColorMap) => {
  const photoColorCodesMap = getPhotoColorCodes();
  const photoColorCodes = {};
  Object.entries(map).forEach(([key, photoColorName]) => {
    photoColorCodes[key] = photoColorCodesMap[photoColorName];
  });
  return photoColorCodes;
};

export const readBitCode = (
  source: Container, draw: boolean = true, rotate180: boolean = false
): number => {
  const { width, height } = source.size;
  const bitPositions = config
    .bitPositions
    .map(pos => {
      if (rotate180) {
        return { x: width - pos.x, y: height - pos.y };
      } else {
        return pos;
      }
    });
  const bitCodeColorCodes = getBitCodePhotoColors(getBitCodeColorMappings());
  const nearestPhotoColorMapper = (nearest.from(bitCodeColorCodes): NearestColorMapper); // todo - better way to type nearest?

  const bits = bitPositions.map(
    pos => readBit(pos, source, nearestPhotoColorMapper)
  );
  if (draw) bitPositions.forEach((pos, index) => {
    if (bits[index] === '1') drawBitOutline(pos, source);
  });

  const number = parseInt(bits.join(''), 2);
  if (draw) copyCanvas(source, getNextProcessingContainer(source.size, 'Bit code'));
  logger.info('Detected bits');
  logger.info(bits);
  logger.info('Sheet number: ' + number);
  return number;
};

export const isBitCodeInCorrectCorner = (source: Container): boolean => {
  const result = readBitCode(source, false) > 0;
  if (result) {
    logger.info('bitcode is in correct corner');
  } else {
    logger.info('bitcode is not in correct corner');
  }
  return result;
};

export const isBitCodeInWrongCorner = (source: Container): boolean => {
  const result = readBitCode(source, false, true) > 0;
  if (result) {
    logger.info('bitcode is in wrong corner');
  } else {
    logger.info('bitcode is not in wrong corner');
  }
  return result;
};