import config from "../config";
import logger from "../utils/logger";
import { photoColors } from "./pushwagnerColorMaps";

const LOCAL_STORAGE_KEY = 'colorCalibration';

const persistColors = (colors) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(colors));
  logger.info('Persisted calibrated colors');
};

export const loadColors = (colorTarget) => {
  const persistedColors = localStorage.getItem(LOCAL_STORAGE_KEY);
  if(persistedColors){
    const parsedColors = JSON.parse(persistedColors);
    Object.keys(parsedColors).forEach(key => {
      colorTarget[key] = parsedColors[key].hex;
    })
  }
  logger.info('Loaded calibrated colors');
};

const averageColorAroundPoint = (sourceContainer, padding, point) => {
  const { x, y } = point;
  const { width, height } = sourceContainer.dimensions;
  const imageData = sourceContainer.ctx.getImageData(0, 0, width, height);
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
  const hex = `#${r.toString(16)}${r.toString(16)}${r.toString(16)}`;
  return { r, g, b, hex };
};

export const drawPhotoColors = (photoColors, ctx) => {
  const paddingX = 100;
  const paddingY = 50;
  logger.info('Drawing calibrated colors');
  Object.keys(photoColors).forEach(key => {
    const color = photoColors[key];
    const position = config.colorPositions[key];
    ctx.fillStyle=color;
    ctx.fillRect(x - paddingX, y - paddingY, 2 * paddingX, 2 * paddingY);
  });
};

export const calibrateColors = (sourceContainer, colorTarget) => {
  const padding = 3;
  const colorPositions = config.colorPositions;

  logger.info('Calibrating colors');
  Object.keys(colorPositions).forEach(key => {
    const color = averageColorAroundPoint(sourceContainer, padding, colorPositions[key]);
    logger.info(`color ${key} = ${color.r}${color.g}${color.b} / ${color.hex}`);
    colorTarget[key] = color.hex;
  });
  persistColors(colorPositions);
};
