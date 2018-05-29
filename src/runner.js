import logger from "./utils/logger";
import config from "./config";
import status from './communication/statusIndicator';
import {
  findSheet,
  sheetPositionHasChanged
} from "./detection/sheetDetection";
import { captureImage } from "./detection/capturing";
import { process } from "./processing/processor";
import { isCircleOccluded } from "./detection/outlineOcclusionDetection";
import { mapToJsFeatImageData } from "./utils/gfx/jsfeat.utils";
import { uploadFile } from "./communication/fileUploader";
import { abortable, timeout } from "./utils/promises";
import { isRunning, startRunning, stopRunning } from "./runstatus";
import { isSheetPresent, isSheetPresentBW } from "./detection/sheetPresence";
import { clearCtx } from "./utils/gfx/context.utils";
import { defaultMappings, mappings } from "./processing/pushwagnerColorMaps";
import variations from "./processing/sceneVariations";
import {
  getImageMappingsWithDefaults,
  getVariationMappingsWithDefaults
} from "./processing/colorMapping";
import imageCodes from "./processing/imageCodes";

// STATE! OH NO!
let oldSheetParams = null;
let uploadAfterCapture = config.defaultUploadAfterCapture;

const debounceLength = 5;
const debounce = [];

export const setUploadAfterCapture = (value) => {
  uploadAfterCapture = value;
};

const debouncedOccluded = () => {
  for(let i=0; i<debounceLength; i++){
    if(debounce[i] !== true){
      //console.log('not occ', i);
      return false;
    }
  }
  return true;
};

const debouncedNotOccluded = () => {
  for(let i=0; i<debounceLength; i++){
    if(debounce[i] !== false){
     // console.log('occ', i);
      return false;
    }
  }
  return true;
};

const isOccludedDebounced = async (canvases, sourceElement) => {
  for(let i=0; i<debounceLength; i++){
    debounce[i] = false;
  }

  let debounceNum = 0;
  while(!debouncedOccluded() && isRunning()){
    debounce[debounceNum] = isCircleOccluded(canvases);
    debounceNum = (debounceNum + 1) % debounceLength;
    await abortable(() => captureImage(canvases, sourceElement));
  }
  logger.info('HAND detected');
};

const isNotOccludedDebounced = async (canvases, sourceElement) => {
  for(let i=0; i<debounceLength; i++){
    debounce[i] = true;
  }

  let debounceNum = 0;
  while(!debouncedNotOccluded() && isRunning()){
    debounce[debounceNum] = isCircleOccluded(canvases);
    debounceNum = (debounceNum + 1) % debounceLength;
    await abortable(() => captureImage(canvases, sourceElement));
  }
  logger.info('HAND NOT detected');
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

const clearCanvases = (canvases) => {
  clearCtx(canvases.correctedSheetRotation);
  clearCtx(canvases.correctedSheetScaling);
  clearCtx(canvases.correctedSheetFlipping);
  clearCtx(canvases.bitCodeDetection);
  clearCtx(canvases.edges);
  clearCtx(canvases.removedElements);
  clearCtx(canvases.filledExpanded);
  clearCtx(canvases.filledContracted);
  clearCtx(canvases.mask);
  clearCtx(canvases.extracted);
  clearCtx(canvases.cropped);
  clearCtx(canvases.colored1);
  clearCtx(canvases.colored2);
  clearCtx(canvases.colored3);
  clearCtx(canvases.colored4);
  clearCtx(canvases.uploadable1);
  clearCtx(canvases.uploadable2);
  clearCtx(canvases.uploadable3);
  clearCtx(canvases.uploadable4);
};

const runSingleCycle = async (canvases) => {

  const videoFrameCtx = canvases.videoFrame.ctx;

  // check for sheet (scan across image looking for changed pixels)

  if (config.source === 'video'){
    if(config.differentialSheetPresenceDetection){
      if(!(await abortable(() => isSheetPresent(canvases)))) {
        logger.info('No sheet present, aborting');
        return;
      }
    } else {
      const { width, height } = canvases.videoFrame.dimensions;
      const videoFrameImage = await abortable(() => mapToJsFeatImageData(videoFrameCtx, width, height));

      if (!(await abortable(() => isSheetPresentBW(videoFrameImage, width, height)))) {
        logger.info('No sheet present, aborting');
        return;
      }
    }
  }

  logger.info('Sheet is present, looking for corners');

  const sheetParams = await abortable(() => findSheet(canvases));
  if (sheetParams === null) {
    logger.error('Sheet should be present but I couldnt find it');
    throw new Error('Sheet should be present but I couldnt find it')
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
  const bitCode = await abortable(() => process(canvases, sheetParams));

  if (config.uploadFile && uploadAfterCapture) {
    await uploadFile(canvases.uploadable1.canvas, bitCode, 0);
    await uploadFile(canvases.uploadable2.canvas, bitCode, 1);
    await uploadFile(canvases.uploadable3.canvas, bitCode, 2);
    await uploadFile(canvases.uploadable4.canvas, bitCode, 3);
  }
  status.success();
  await timeout(2000);
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
        await runSingleCycle(canvases);
      } catch (error) {
        if (error !== 'ABORT') {
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

    await runSingleCycle(canvases);
    logger.info('Completed single cycle, resetting state to be able to restart');
  } catch (error) {
    if (error !== 'ABORT') {
      await indicateFailure(error);
    }

  }
  oldSheetParams = null;
  stopRunning();
};