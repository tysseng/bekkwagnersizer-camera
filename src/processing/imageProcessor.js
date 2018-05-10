import 'floodfill';
import { mapToJsFeatImageData } from './jsfeat.utils';
import { detectSheetPosition } from "./sheetDetection";
import { detectLines } from "./lineDetection";
import { timed } from "../utils/timer";
import {
  drawImageOnCanvas,
  drawImageRotatedAroundCenter,
  drawJsFeatImageOnContext,
  floodFill
} from "./draw";
import { extractSheetUsingRotationAndScaling } from "./sheetExtractorApproximate";
import { erodeMask, getMonocromeMask, removeMask } from "./mask";
import { copyCanvas } from "./context.utils";
import logger from '../utils/logger';
import { removeLogosAndShit } from "./logoRemoval";

const drawImageOnCanvasAndDetectCorners = (ctx, width, height, rotation = 0) => {
  if (rotation !== 0) {
    timed(() => drawImageRotatedAroundCenter(ctx, width, height, -rotation), 'rotate');
  } else {
    drawImageOnCanvas(ctx);
  }
  const grayscaledImage = mapToJsFeatImageData(ctx, width, height);
  return detectSheetPosition(ctx, grayscaledImage, width, height);
};

const process = (canvases, canvas, outputCtx, maskCtx, width, height) => {

  let sheetCorners;
  try {
    sheetCorners = drawImageOnCanvasAndDetectCorners(canvases.detectedSheet.ctx, width, height, 0);
  } catch (error) {
    // if fails, rotate and try again. 0.05 seems like a good rotation, though we get some false
    // corners close to the edge, so we need to ignore those. Drawing on top of the existing image
    // works nicely as long as the sheet is not too close to the edge.
    sheetCorners = drawImageOnCanvasAndDetectCorners(canvases.detectedSheet.ctx, width, height, 0.05);
  }

  // copy to be able to debug.
  copyCanvas(canvases.detectedSheet, canvases.correctedSheet);

  // extract sheet, also writes to correctedSheet canvases as intermediate steps.
  const sheetImageBW = extractSheetUsingRotationAndScaling(
    sheetCorners,
    width,
    height,
    canvases.correctedSheet.canvas,
    canvases.correctedSheet.ctx,
    canvases.correctedSheet2.ctx,
  );

  // find lines to prepare for flood fill
  const jsFeatImageWithDilutedLines = timed(() => detectLines(sheetImageBW, width, height), 'detect lines');
  drawJsFeatImageOnContext(jsFeatImageWithDilutedLines, canvases.edges.ctx, width, height);

  // copy to be able to debug.
  copyCanvas(canvases.edges, canvases.removedElements);

  // remove logos and other stuff
  removeLogosAndShit(canvases.removedElements.ctx);

  // copy to be able to debug.
  copyCanvas(canvases.removedElements, canvases.filled);

  // flood fill outside (e.g. the part that will be our mask)
  timed(() => floodFill(canvases.filled.ctx, 255, 0, 0, 0.5), 'flood fill mask');

  // turn image monocrome by clearing all pixels that are not part of the mask
  const monocromeMask = timed(() => getMonocromeMask(
    canvases.filled.ctx, width, height
  ), 'get monocrome mask');

  // erode mask, putting back the pixels that were added when the lines were diluted during edge
  // detection
  timed(() => erodeMask(
    canvases.mask.ctx,
    canvases.edges.ctx,
    monocromeMask,
    width,
    height
  ), 'mask erosion');

  timed(() => removeMask(
    canvases.mask.ctx,
    canvases.correctedSheet2.ctx,
    canvases.extracted.ctx,
    width,
    height
  ), 'remove mask');
};

export default (canvases, width, height) => {
  const canvas = canvases.videoFrame.canvas;
  const targetCtx = canvases.detectedSheet.ctx;
  const targetCtx2 = canvases.correctedSheet.ctx;
  const startTime = new Date().getTime();
  process(canvases, canvas, targetCtx, targetCtx2, width, height);
  const endTime = new Date().getTime();

  logger.info('Finished, this took ' + (endTime - startTime) + 'ms', startTime, endTime);
}

// TODO
/*
Must make sure we capture the whole table in the photo, and remove the parts outside, to
guarantee that the sheet is inside the table area. Ideally the table should be square?
 */