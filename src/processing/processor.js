// @flow
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
import { correctColors } from "../colorizing/colorCorrection";
import logger from "../utils/logger";
import { getNextProcessingContainer } from "../canvases";
import type { Container, Containers, SheetParams } from "../types";

type ProcessResult = {
  uploadable: Containers,
  bitCode: number,
}

// Extract detected sheet, detect drawing type and isolate drawing.
export const process = (videoFrameContainer: Container, sheetParams: SheetParams): ProcessResult => {

  if (sheetParams.sheetCorners === null) {
    throw Error('Could not detect sheet corners');
  }

  const extractedSheetContainer = extractSheet(videoFrameContainer, sheetParams);

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
  timed(() => removeBitDots(removedElementsContainer), 'removing bit dots');

  // expand outline to be able to flood fill safely
  const filledContractedContainer = floodFillWithPadding(removedElementsContainer);

  // turn image monocrome by clearing all pixels that are not part of the mask
  const monocromeMask = timed(() => getMonocromeMask(filledContractedContainer), 'get monocrome mask');

  // erode mask, putting back the pixels that were added when the lines were diluted during edge
  // detection
  const maskContainer = timed(() => getErodedMask(edgesContainer, monocromeMask), 'mask erosion');
  const extractedContainer = timed(() => removeMask(maskContainer, extractedSheetContainer), 'remove mask');

  // crop away unwanted edges
  const croppedContainer = getNextProcessingContainer(config.croppedSize, 'Cropped');
  copyCanvasCentered(extractedContainer, croppedContainer);

  // change colors to match variations
  const coloredContainers = timed(() => correctColors(croppedContainer, bitCode), 'Detecting and replacing colors!');

  // resize to uploadable size
  const uploadContainers = {};
  Object.keys(coloredContainers).forEach(key => {
    uploadContainers[key] = resizeToUploadSize(coloredContainers[key]);
  });

  return {
    uploadable: uploadContainers,
    bitCode
  }
};