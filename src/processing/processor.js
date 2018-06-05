import 'floodfill';
import config from "../config";
import { detectEdges } from "./edgeDetection";
import { timed } from "../utils/timer";
import { getErodedMask, getMonocromeMask, removeMask } from "./mask";
import { copyCanvas, copyCanvasCentered } from "../utils/gfx/context.utils";
import { removeLogo } from "./logo";
import { readBitCode, removeBitDots } from "./bitCode";
import { extractSheet } from "./sheetExtractorExact";
import { resizeToUploadSize } from "./uploadResizer";
import { floodFillWithPadding } from "./floodFiller";
import { correctColors, updateColorsForAllImages } from "./pushwagnerify";
import logger from "../utils/logger";
import { photoColors } from "./pushwagnerColorMaps";
import { calibrateColors, drawPhotoColors } from "./colorCalibration";
import { getNextProcessingContainer } from "../canvases";

export const calibrate = (canvases, sheetParams) => {

  const { sheetCorners, prerotation } = sheetParams;

  if (sheetCorners === null) {
    throw Error('Could not detect sheet corners');
  }

  const extractedSheetContainer = extractSheet(
    canvases.videoFrame,
    sheetCorners,
    prerotation,
  );

  // Calibration used to be triggable using a bitCode, but errors while reading bit code
  // caused calibrations from non calibration sheets, so now it's purely manual.
  calibrateColors(extractedSheetContainer, photoColors);
  drawPhotoColors(photoColors, canvases.photoColors);
  updateColorsForAllImages();
};

// Extract detected sheet, detect drawing type and isolate drawing.
export const process = (videoFrame, sheetParams) => {

  const { sheetCorners, prerotation } = sheetParams;

  if (sheetCorners === null) {
    throw Error('Could not detect sheet corners');
  }

  const extractedSheetContainer = extractSheet(
    videoFrame,
    sheetCorners,
    prerotation,
  );

  // detect bit code to see what image this is
  logger.info('Looking for bitcode');
  const bitCode = timed(() => readBitCode(extractedSheetContainer), 'Reading bit code');
  if (bitCode === 0) {
    throw new Error('No bitcode found, aborting');
  }

  // find lines to prepare for flood fill
  const edgesContainer = timed(() => detectEdges(extractedSheetContainer), 'detect lines');

  // remove logos and other stuff
  // copy to be able to debug.
  const removedElementsContainer = getNextProcessingContainer(config.sheetSize, 'Removed design elements');
  copyCanvas(edgesContainer, removedElementsContainer);
  if (config.removeLogo) timed(() => removeLogo(removedElementsContainer), 'removing logo');
  if (config.removeBitcode) timed(() => removeBitDots(removedElementsContainer), 'removing bit dots');

  let filledContractedContainer;

  // expand outline to be able to flood fill safely
  filledContractedContainer = floodFillWithPadding(removedElementsContainer);

  // turn image monocrome by clearing all pixels that are not part of the mask
  const monocromeMask = timed(() => getMonocromeMask(filledContractedContainer), 'get monocrome mask');

  // erode mask, putting back the pixels that were added when the lines were diluted during edge
  // detection
  const maskContainer = timed(() => getErodedMask(edgesContainer, monocromeMask), 'mask erosion');
  const extractedContainer = timed(() => removeMask(maskContainer, extractedSheetContainer), 'remove mask');

  // crop away unwanted edges
  const croppedContainer = getNextProcessingContainer(config.croppedSize, 'Cropped');
  copyCanvasCentered(extractedContainer, croppedContainer);

  const coloredContainers = timed(() => correctColors(croppedContainer, bitCode), 'Pushwagnerifying!');
  const uploadContainers = coloredContainers.map(
    coloredContainer => resizeToUploadSize(coloredContainer)
  );

  return {
    uploadable: uploadContainers,
    bitCode
  }
};