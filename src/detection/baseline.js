// @flow
import logger from "../utils/logger";
import { captureBaselineVideoFrame } from "./capturing";
import { captureOriginalCircle } from "./occlusionDetection";
import { captureOriginalSheetPresenceLine } from "./sheetPresence";
import type { Container, SourceElement } from "../types";
import { convertCanvasToBase64Png, drawBase64PngToContext } from "../utils/gfx/canvas.utils";

const LOCAL_STORAGE_KEY = 'baselineImg';
const persistBaselineImage = (baselineContainer: Container) => {
  logger.info("Saving baseline image from local storage");
  const pngString = convertCanvasToBase64Png(baselineContainer.canvas);
  localStorage.setItem(LOCAL_STORAGE_KEY, pngString);
};

const setBaseline = (baselineContainer: Container) => {
  logger.info("Process baseline image");
  try {
    captureOriginalCircle(baselineContainer);
    captureOriginalSheetPresenceLine(baselineContainer);
  } catch (error) {
    logger.error('Could not set baseline');
    logger.error(error);
  }
};

export const loadBaselineFromLocalStorage = (baselineContainer: Container) => {
  logger.info("Load baseline image from local storage");
  const pngString = localStorage.getItem(LOCAL_STORAGE_KEY);
  drawBase64PngToContext(pngString, baselineContainer.ctx);
  setBaseline(baselineContainer);
};

export const updateBaselineFromVideo = (videoElement: SourceElement, baselineContainer: Container) => {
  logger.info("Process baseline image");
  try {
    captureBaselineVideoFrame(videoElement, baselineContainer);
    captureOriginalCircle(baselineContainer);
    captureOriginalSheetPresenceLine(baselineContainer);
    persistBaselineImage(baselineContainer);
  } catch (error) {
    logger.error('Could not set baseline');
    logger.error(error);
  }
};
