import 'floodfill';
import config from "../config";
import { detectEdges } from "./edgeDetection";
import { timed } from "../utils/timer";
import { drawJsFeatImageOnContext } from "../utils/gfx/draw";
import { extractSheetUsingRotationAndScaling } from "./sheetExtractorApproximate";
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

  const { width: frameWidth, height: frameHeight } = config.sourceSize;
  const { width: sheetWidth, height: sheetHeight } = config.sheetSize;

  const { sheetCorners, detectedSheetCanvasContainer, prerotation } = sheetParams;

  if (sheetCorners === null) {
    throw Error('Could not detect sheet corners');
  }

  // copy to be able to debug.
  copyCanvas(detectedSheetCanvasContainer, canvases.correctedSheetRotation);

  let sheetImageBW;
  if (config.sheetCorrection === 'exact') {
    sheetImageBW = extractSheetUsingPerspectiveTransformation(
      sheetCorners,
      frameWidth,
      frameHeight,
      sheetWidth,
      sheetHeight,
      prerotation,
      canvases,
    );
  } else {
    // extract sheet, also writes to correctedSheet canvases as intermediate steps.
    sheetImageBW = extractSheetUsingRotationAndScaling(
      sheetCorners,
      frameWidth,
      frameHeight,
      sheetWidth,
      sheetHeight,
      prerotation,
      canvases,
    );
  }

  // Calibration used to be triggable using a bitCode, but errors while reading bit code
  // caused calibrations from non calibration sheets, so now it's purely manual.
  if(isCalibration){
    calibrateColors(canvases.correctedSheetFlipping, photoColors);
    drawPhotoColors(photoColors, canvases.photoColors);
    updateColorsForAllImages();
    return config.colorBitcode;
  }

  // detect bit code to see what image this is
  logger.info('Looking for bitcode');
  const bitCode = timed(() => readBitCode(canvases.correctedSheetFlipping, sheetWidth, sheetHeight, canvases), 'Reading bit code');
  if(bitCode === 0){
    throw new Error('No bitcode found, aborting');
  }

  // find lines to prepare for flood fill
  const jsFeatImageWithDilutedLines = timed(() => detectEdges(sheetImageBW, sheetWidth, sheetHeight), 'detect lines');
  drawJsFeatImageOnContext(jsFeatImageWithDilutedLines, canvases.edges.ctx, sheetWidth, sheetHeight);

  // copy to be able to debug.
  copyCanvas(canvases.edges, canvases.removedElements);

  // remove logos and other stuff
  if(config.removeLogo) timed(() => removeLogo(canvases.removedElements.ctx), 'removing logo');
  if(config.removeBitcode) timed(() => removeBitDots(canvases.removedElements.ctx), 'removing bit dots');


  if(config.padBeforeFloodFilling){
    // expand outline to be able to flood fill safely
    floodFillWithPadding(canvases.removedElements, canvases);
  } else {
    floodFillWithoutPadding(canvases.removedElements, canvases);
  }

  // turn image monocrome by clearing all pixels that are not part of the mask
  const monocromeMask = timed(() => getMonocromeMask(
    canvases.filledContracted.ctx, sheetWidth, sheetHeight
  ), 'get monocrome mask');

  // erode mask, putting back the pixels that were added when the lines were diluted during edge
  // detection
  timed(() => erodeMask(
    canvases.mask.ctx,
    canvases.edges.ctx,
    monocromeMask,
    sheetWidth,
    sheetHeight
  ), 'mask erosion');

  timed(() => removeMask(
    canvases.mask.ctx,
    canvases.correctedSheetFlipping.ctx,
    canvases.extracted.ctx,
    sheetWidth,
    sheetHeight
  ), 'remove mask');

  // crop away unwanted edges
  copyCanvasCentered(canvases.extracted, canvases.cropped);

  timed(() => correctColors(canvases, bitCode), 'Pushwagnerifying!');
  resizeToUploadSize(canvases.colored1.canvas, canvases.uploadable1.ctx, sheetWidth, sheetHeight);
  resizeToUploadSize(canvases.colored2.canvas, canvases.uploadable2.ctx, sheetWidth, sheetHeight);
  resizeToUploadSize(canvases.colored3.canvas, canvases.uploadable3.ctx, sheetWidth, sheetHeight);
  resizeToUploadSize(canvases.colored4.canvas, canvases.uploadable4.ctx, sheetWidth, sheetHeight);

  return bitCode;
};