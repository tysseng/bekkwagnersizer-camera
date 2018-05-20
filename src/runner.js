import logger from "./utils/logger";
import config from "./config";
import { findSheet, isSheetPresent, sheetPositionHasChanged } from "./detection/sheetDetection";
import { captureImage } from "./detection/capturing";
import { process } from "./processing/processor";
import { isCircleOccluded } from "./detection/outlineOcclusionDetection";
import { mapToJsFeatImageData } from "./utils/gfx/jsfeat.utils";
import { uploadFile } from "./communication/fileUploader";
import { abortable, timeout } from "./utils/promises";
import { isRunning, startRunning, stopRunning } from "./runstatus";
import { timed } from "./utils/timer";

// STATE! OH NO!
let oldSheetParams = null;

const waitForHandInOut = async (canvases, sourceElement) => {
  if (config.detectHand) {
    // TODO: convert isCircleOccluded to grayscale?

    // TODO: What if sheet was replaced while processing? check for sheet as well?

    // wait for hand
    logger.info('waiting for hand');
    while (!isCircleOccluded(canvases) && isRunning()) {
      await abortable(() => captureImage(canvases, sourceElement));
    }
    logger.info('waiting for hand to go away');
    while (isCircleOccluded(canvases) && isRunning()) {
      await abortable(() => captureImage(canvases, sourceElement));
    }
  }
}

const runSingleCycle = async (canvases) => {

  const videoFrameCtx = canvases.videoFrame.ctx;

  // check for sheet (scan diagonal looking for white pixels)
  const { width, height } = canvases.videoFrame.dimensions;
  const videoFrameImage = await abortable(() => mapToJsFeatImageData(videoFrameCtx, width, height));
  if (!(await abortable(() => isSheetPresent(videoFrameImage, width, height)))) {
    logger.info('No sheet present, aborting');
    return;
  }
  logger.info('Sheet is present, looking for corners');

  const sheetParams = await abortable(() => findSheet(canvases));
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

  const bitCode = await abortable(() => process(canvases, sheetParams));

  if (config.uploadFile) {
    await uploadFile(canvases.uploadable.canvas, bitCode);
  }
};

export const stop = () => {
  stopRunning();
  logger.info('Image processing stopped');
};

export const run = async (canvases, sourceElement) => {
  try {
    startRunning();
    logger.info('Running image processing');
    while (isRunning()) {
      await abortable(() => captureImage(canvases, sourceElement));
      await waitForHandInOut(canvases, sourceElement);
      // TODO: wait for 2 seconds with possibility of aborting if hand is detected again.
      await runSingleCycle(canvases);
      logger.info('do the loop');
    }
  } catch (error) {
    logger.info('Caught error, resetting state to be able to restart');
    oldSheetParams = null;
  }
};

export const runOnce = async (canvases, sourceElement) => {
  try {
    startRunning();
    logger.info('Running image processing once');

    await abortable(() => captureImage(canvases, sourceElement));
    logger.info('Captured initial frame');

    await runSingleCycle(canvases);
    logger.info('Completed single cycle, resetting state to be able to restart');
    oldSheetParams = null;
    stopRunning();
  } catch (error) {
    logger.info('Caught error, resetting state to be able to restart');
    oldSheetParams = null;
  }
};