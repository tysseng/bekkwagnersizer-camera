import 'floodfill';
import config from "../config";
import { detectEdges } from "./edgeDetection";
import { timed } from "../utils/timer";
import { drawJsFeatImageOnContext } from "../utils/gfx/draw";
import { erodeMask, getMonocromeMask, removeMask } from "./mask";
import { copyCanvas, copyCanvasCentered } from "../utils/gfx/context.utils";
import { removeLogo } from "./logo";
import { readBitCode, removeBitDots } from "./bitCode";
import { extractSheetUsingPerspectiveTransformation } from "./sheetExtractorExact";
import { resizeToUploadSize } from "./uploadResizer";
import { floodFillWithoutPadding, floodFillWithPadding } from "./floodFiller";
import { correctColors, updateColorsForAllImages } from "./pushwagnerify";
import logger from "../utils/logger";
import { photoColors } from "./pushwagnerColorMaps";
import { calibrateColors, drawPhotoColors } from "./colorCalibration";


// Extract detected sheet, detect drawing type and isolate drawing.
export const process = (canvases, sheetParams, isCalibration = false) => {

  const { sheetCorners, detectedSheetCanvasContainer, prerotation } = sheetParams;

  if (sheetCorners === null) {
    throw Error('Could not detect sheet corners');
  }

  // copy to be able to debug.
  copyCanvas(detectedSheetCanvasContainer, canvases.correctedSheetRotation);

  extractSheetUsingPerspectiveTransformation(
    sheetCorners,
    prerotation,
    canvases,
  );

  // Calibration used to be triggable using a bitCode, but errors while reading bit code
  // caused calibrations from non calibration sheets, so now it's purely manual.
  if (isCalibration) {
    calibrateColors(canvases.correctedSheetFlipping, photoColors);
    drawPhotoColors(photoColors, canvases.photoColors);
    updateColorsForAllImages();
    return config.colorBitcode;
  }

  // detect bit code to see what image this is
  logger.info('Looking for bitcode');
  const bitCode = timed(() => readBitCode(canvases.correctedSheetFlipping, canvases), 'Reading bit code');
  if (bitCode === 0) {
    throw new Error('No bitcode found, aborting');
  }

  // find lines to prepare for flood fill
  // TODO: gray must be on correctedSheetFlipping?
  const jsFeatImageWithDilutedLines = timed(() => detectEdges(canvases.correctedSheetScaling), 'detect lines');
  drawJsFeatImageOnContext(jsFeatImageWithDilutedLines, canvases.edges);

  // copy to be able to debug.
  copyCanvas(canvases.edges, canvases.removedElements);

  // remove logos and other stuff
  if (config.removeLogo) timed(() => removeLogo(canvases.removedElements), 'removing logo');
  if (config.removeBitcode) timed(() => removeBitDots(canvases.removedElements), 'removing bit dots');

  if (config.padBeforeFloodFilling) {
    // expand outline to be able to flood fill safely
    floodFillWithPadding(canvases.removedElements, canvases);
  } else {
    floodFillWithoutPadding(canvases.removedElements, canvases);
  }

  // turn image monocrome by clearing all pixels that are not part of the mask
  const monocromeMask = timed(() => getMonocromeMask(canvases.filledContracted), 'get monocrome mask');

  // erode mask, putting back the pixels that were added when the lines were diluted during edge
  // detection
  timed(() => erodeMask(canvases.mask, canvases.edges, monocromeMask,), 'mask erosion');
  timed(() => removeMask(canvases.mask, canvases.correctedSheetFlipping, canvases.extracted), 'remove mask');

  // crop away unwanted edges
  copyCanvasCentered(canvases.extracted, canvases.cropped);

  timed(() => correctColors(canvases, bitCode), 'Pushwagnerifying!');
  resizeToUploadSize(canvases.colored1, canvases.uploadable1);
  resizeToUploadSize(canvases.colored2, canvases.uploadable2);
  resizeToUploadSize(canvases.colored3, canvases.uploadable3);
  resizeToUploadSize(canvases.colored4, canvases.uploadable4);

  return bitCode;
};