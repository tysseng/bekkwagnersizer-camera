// @flow
import logger from '../utils/logger';
import config from '../config';
import { getAverageColor } from "../utils/gfx/jsfeat.utils";
import type { Container, JsFeatImage } from "../types";

const logoCenter = config.logoDetectionPosition;
const logoSamplePadding = 5;

export const isLogoInCorrectCorner = (
  image: JsFeatImage, width: number, height: number
): boolean => {
  const topLeftColor = getAverageColor(image, width, logoSamplePadding, logoCenter.x, logoCenter.y);
  const bottomRightColor = getAverageColor(image, width, logoSamplePadding, width - logoCenter.x, height - logoCenter.y);

  if(topLeftColor < bottomRightColor) { // logo is black
    logger.info("logo is in correct corner");
    return true;
  } else {
    logger.info("logo is in wrong corner, rotate sheet!");
    return false;
  }
};

export const removeLogo = (container: Container) => {
  const ctx = container.ctx;
  const {x, y, width, height} = config.logoBoundingBox;
  ctx.beginPath();
  ctx.fillRect(x, y, width, height);
  ctx.stroke();
};