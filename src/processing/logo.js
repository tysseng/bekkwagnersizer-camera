import logger from '../utils/logger';
import config from '../config';
import { getAverageColor } from "../utils/gfx/jsfeat.utils";

const logoCenter = config.logoDetectionPosition;
const logoSamplePadding = 5;

export const isLogoInCorrectCorner = (image, width, height) => {
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

export const removeLogo = (ctx) => {
  const {x, y, width, height} = config.logoBoundingBox;
  ctx.beginPath();
  ctx.fillRect(x, y, width, height);
  ctx.stroke();
};