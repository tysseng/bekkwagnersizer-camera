import logger from "./utils/logger";
import config from "./config";
import status from './communication/statusIndicator';
import {
  findSheet,
  sheetPositionHasChanged
} from "./detection/sheetDetection";
import { captureImage } from "./detection/capturing";
import { process } from "./processing/processor";
import {
  isNotOccludedDebounced,
  isOccludedDebounced
} from "./detection/outlineOcclusionDetection";
import { uploadFile } from "./communication/fileUploader";
import { abortable, timeout } from "./utils/promises";
import { isRunning, startRunning, stopRunning } from "./runstatus";
import { isSheetPresent } from "./detection/sheetPresence";
import { photoColors } from "./processing/glitchColorMaps";
import { drawPhotoColors, loadColors } from "./processing/colorCalibration";
import { updateColorsForAllImages } from "./processing/pushwagnerify";
import sceneVariations from "./processing/sceneVariations";
import { clearCanvases } from "./canvases";
import { removeShadows } from "./detection/shadowCatcher";

// STATE! OH NO!
let oldSheetParams = null;
let globalUploadAfterCapture = config.defaultUploadAfterCapture;

export const setUploadAfterCapture = (value) => {
  globalUploadAfterCapture = value;
};

const waitForHandInOut = async (canvases, sourceElement) => {
  if (config.detectHand) {
    // TODO: convert isCircleOccluded to grayscale?

    // TODO: What if sheet was replaced while processing? check for sheet as well?

    // wait for hand
    logger.info('waiting for hand');
    await isOccludedDebounced(canvases, sourceElement);

    logger.info('waiting for hand to go away');
    await isNotOccludedDebounced(canvases, sourceElement);

    logger.info('no hand, waiting to take photo');
    await timeout(1000);
    captureImage(canvases, sourceElement);
    logger.info('Lets go!')
  }
};


const runSingleCycle = async (canvases, uploadAfterCapture, isCalibration) => {

  // check for sheet (scan across image looking for changed pixels)
  if (config.source === 'video') {
    if (!(await abortable(() => isSheetPresent(canvases)))) {
      logger.info('No sheet present, aborting');
      return;
    }
  }

  logger.info('Sheet is present, looking for corners');

  // TODO: This should be moved elsewhere, just here for testing.
  //removeShadows(canvases.videoFrame, canvases.whiteCorrectedVideoFrame, canvases.whitePixelsVideoFrame);

  const sheetParams = await abortable(() => findSheet(canvases));
  if (sheetParams === null) {
    logger.error('Sheet should be present but I couldnt find it');
    throw new Error('RETRY');
  }

  logger.info('Corners found, checking if position has changed');
  if (config.preventDuplicates && !sheetPositionHasChanged(oldSheetParams, sheetParams)) {
    logger.info('Position has not changed, this is the same sheet as last time.');
    return; // same sheet as before, prevent double captures.
  } else {
    oldSheetParams = sheetParams;
  }
  logger.info('Position has changed, this is a new image. Processing');


  // clear all to prepare!
  // If not clearing the source (filledExpanded), floodFill crashes the second time around (!)
  // If not clearing the target (filledContracted), the previous image will be visible through the
  // semi-transparent parts of the new one.
  clearCanvases(canvases);

  status.processing();
  const bitCode = await abortable(() => process(canvases, sheetParams, isCalibration));
  if (bitCode === config.colorBitcode) {
    status.colorsCalibrated();
  } else if (config.uploadFile && uploadAfterCapture) {
    await uploadFile(canvases.uploadable1.canvas, bitCode, sceneVariations.people);
    /*
    await uploadFile(canvases.uploadable2.canvas, bitCode, sceneVariations.manhattan);
    await uploadFile(canvases.uploadable3.canvas, bitCode, sceneVariations.kingscross1);
    await uploadFile(canvases.uploadable4.canvas, bitCode, sceneVariations.kingscross2);*/
    status.success();
  }
  await timeout(4000);
  status.normal();
};

export const stop = () => {
  stopRunning();
  logger.info('Image processing stopped');
};

const indicateFailure = async (error) => {
  status.failure();
  logger.error('Something went wrong in cycle');
  logger.error(error);
  await timeout('2000');
  status.normal();
};

export const run = async (canvases, sourceElement) => {
  startRunning();
  logger.info('Running image processing');
  try {
    while (isRunning()) {
      await abortable(() => captureImage(canvases, sourceElement));
      await waitForHandInOut(canvases, sourceElement);
      logger.info("run for your life, Marty!");
      // TODO: wait for 2 seconds with possibility of aborting if hand is detected again.
      try {
        await runSingleCycle(canvases, globalUploadAfterCapture, false);
      } catch (error) {
        if(error && error.message === 'RETRY'){
          await timeout('500');
          captureImage(canvases, sourceElement);
          await runSingleCycle(canvases, globalUploadAfterCapture, false);
        } else if (error !== 'ABORT') {
          await indicateFailure(error);
        }
      }
      logger.info('do the loop');
    }
  } catch (error) {
    if (error !== 'ABORT') {
      await indicateFailure(error);
    }
  }
  stopRunning();
  oldSheetParams = null;
};

export const runOnce = async (canvases, sourceElement) => {
  try {
    startRunning();
    logger.info('Running image processing once');

    await abortable(() => captureImage(canvases, sourceElement));
    logger.info('Captured initial frame');

    await runSingleCycle(canvases, globalUploadAfterCapture, false);
    logger.info('Completed single cycle, resetting state to be able to restart');
  } catch (error) {
    if (error !== 'ABORT') {
      await indicateFailure(error);
    }

  }
  oldSheetParams = null;
  stopRunning();
};

export const calibrateColors = async (canvases, sourceElement) => {
  try {
    startRunning();
    logger.info('Running color calibration');

    await abortable(() => captureImage(canvases, sourceElement));
    logger.info('Captured initial frame');

    await runSingleCycle(canvases, false, true);
    logger.info('Completed color calibration, resetting state to be able to restart');
  } catch (error) {
    if (error !== 'ABORT') {
      await indicateFailure(error);
    }

  }
  oldSheetParams = null;
  stopRunning();
};

export const init = (canvases) => {
  loadColors(photoColors);
  updateColorsForAllImages();
  drawPhotoColors(photoColors, canvases.photoColors);
};