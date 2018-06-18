//flow
import config from "../config";
import logger from "../utils/logger";
import { clearCtx } from "../utils/gfx/context.utils";
import { getPhotoColorCodes } from "./colorRepository";
import { extractSheet } from "../processing/sheetExtractorExact";
import type { Container, PhotoColorCodesMap, RgbaColor, SheetParams } from "../types";

const LOCAL_STORAGE_KEY = 'colorCalibration';

export const persistColors = (colors: PhotoColorCodesMap) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(colors));
  logger.info('Persisted calibrated colors');
};

export const loadPersistedColors = (): PhotoColorCodesMap => {
  const persistedColors = localStorage.getItem(LOCAL_STORAGE_KEY);
  loadColors(persistedColors);
  logger.info('Loaded persisted calibrated colors');
};

export const loadColors = (colors: PhotoColorCodesMap) => {
  const colorTarget = getPhotoColorCodes();
  if (colors) {
    const parsedColors = JSON.parse(colors);
    Object.keys(parsedColors).forEach(key => {
      colorTarget[key] = parsedColors[key];
    })
  }
  logger.info('Loaded calibrated colors');
};

const averageColorAroundPoint = (source: Container, padding: number, point: Point): RgbaColor => {
  const { x, y } = point;
  const { width, height } = source.size;
  const imageData = source.ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const accumulator = {
    r: 0,
    g: 0,
    b: 0,
  };

  let pixelCounter = 0;

  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      const i = (row * width + col) * 4;

      // converts pixels to a predefined color to ignore black and only read dot color
      accumulator.r += data[i];
      accumulator.g += data[i + 1];
      accumulator.b += data[i + 2];

      pixelCounter++;
    }
  }
  const r = Math.floor(accumulator.r / pixelCounter);
  const g = Math.floor(accumulator.g / pixelCounter);
  const b = Math.floor(accumulator.b / pixelCounter);
  const hexR = r < 16 ? '0' + r.toString(16) : r.toString('16');
  const hexG = g < 16 ? '0' + g.toString(16) : g.toString('16');
  const hexB = b < 16 ? '0' + b.toString(16) : b.toString('16');
  const hex = `#${hexR}${hexG}${hexB}`;
  return { r, g, b, hex };
};

export const drawPhotoColors = (target: Container) => {
  const photoColors = getPhotoColorCodes();
  clearCtx(target);
  const ctx = target.ctx;
  const paddingX = 200;
  const paddingY = 60;
  logger.info('Drawing calibrated colors');
  Object.keys(photoColors).forEach(key => {
    const color = photoColors[key];
    const position = config.calibrationColorPositions[key];
    const { x, y } = position;
    ctx.fillStyle = color;
    ctx.fillRect(x - paddingX, y - paddingY, 2 * paddingX, 2 * paddingY);
  });
};

const calibrateColors = (source: Container) => {
  const colorTarget = getPhotoColorCodes();
  const padding = 2;
  const colorPositions = config.calibrationColorPositions;

  logger.info('Calibrating colors');
  Object.keys(colorPositions).forEach(key => {
    const color = averageColorAroundPoint(source, padding, colorPositions[key]);
    logger.info(`color ${key} = ${color.r}-${color.g}-${color.b} / ${color.hex}`);
    colorTarget[key] = color.hex;
  });
  persistColors(colorTarget);
};


export const calibrate = (
  videoFrameContainer: Container,
  photoColorsContainer: Container,
  sheetParams: SheetParams,
) => {
  if (sheetParams.sheetCorners === null) {
    throw Error('Could not detect sheet corners');
  }

  const extractedSheetContainer = extractSheet(videoFrameContainer, sheetParams);

  // Calibration used to be triggerable using a bitCode, but errors while reading bit code
  // caused calibrations from non calibration sheets, so now it's purely manual.
  calibrateColors(extractedSheetContainer);
  drawPhotoColors(photoColorsContainer);
};

