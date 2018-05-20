import logger from "./utils/logger";
import config from "./config";
import { findSheet, isSheetPresent, sheetPositionHasChanged } from "./detection/sheetDetection";
import { captureImage } from "./detection/capturing";
import { process } from "./processing/processor";
import { isCircleOccluded } from "./detection/outlineOcclusionDetection";
import { mapToJsFeatImageData } from "./utils/gfx/jsfeat.utils";
import { uploadFile } from "./communication/fileUploader";

// STATE! OH NO!
let oldSheetParams = null;
let running = true;

export const runSingleCycle = (canvases, sourceElement) => {
  const videoFrameCtx = canvases.videoFrame.ctx;

  captureImage(canvases, sourceElement);
  logger.info('Captured initial frame');

  if (config.detectHand) {

    // TODO: convert isCircleOccluded to grayscale?

    // wait for hand
    while (!isCircleOccluded(videoFrameCtx)) {
      captureImage(canvases, sourceElement);
      // TODO: non-blocking delay
    }
    // wait for hand to go away
    while (isCircleOccluded(videoFrameCtx)) {
      captureImage(canvases, sourceElement);
      // TODO: non-blocking delay
    }
  }

  // wait for 2 seconds
  // check for sheet (scan diagonal looking for white pixels)
  const { width, height } = canvases.videoFrame.dimensions;
  const videoFrameImage = mapToJsFeatImageData(videoFrameCtx, width, height);
  if (!isSheetPresent(videoFrameImage, width, height)) {
    return;
  }
  logger.info('Sheet is present, looking for corners');

  const sheetParams = findSheet(canvases);
  if (sheetParams === null) {
    logger.error('Sheet should be present but I couldnt find it');
    return;
  }

  logger.info('Corners found, checking if position has changed');
  if (config.preventDuplicates && !sheetPositionHasChanged(oldSheetParams, sheetParams)) {
    logger.info('Position has not changed, this is the same sheet as last time.');
    return; // same sheet as before, prevent double captures.
  } else {
    oldSheetParams = sheetParams;
  }
  logger.info('Position has changed, this is a new image. Processing');

  const bitCode = process(canvases, sheetParams);

  if (config.uploadFile) uploadFile(canvases.uploadable.canvas, bitCode);
};

export const stop = () => {
  running = false;
  logger.info('Image processing stopped');
};

export const run = (canvases, sourceElement) => {
  running = true;
  logger.info('Running image processing');
  //TODO yield to prevent ui lockup
  while (config.loop && running) {
    runSingleCycle(canvases, sourceElement);
  }
};