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
import config from "../config";
import { captureOriginalCircle, isCircleOccluded } from "./outlineOcclusionDetection";

const drawImageOnCanvasAndDetectCorners = (imageCanvas, ctx, width, height, rotation = 0) => {
  if (rotation !== 0) {
    timed(() => drawImageRotatedAroundCenter(imageCanvas, ctx, width, height, -rotation), 'rotate');
  } else {
    drawImageOnCanvas(imageCanvas, ctx);
  }
  const grayscaledImage = mapToJsFeatImageData(ctx, width, height);
  return detectSheetPosition(ctx, grayscaledImage);
};

const process = (canvases) => {

  let sheetCorners;
  let detectedSheetCanvasContainer;
  let prerotation = 0;

  const { width: frameWidth, height: frameHeight } = config.videoFrameSize;
  const { width: sheetWidth, height: sheetHeight } = config.sheetSize;

  const isOccluded = isCircleOccluded(canvases.videoFrame.ctx);
  if(isOccluded){
    console.log("HAND");
  } else {
    console.log("NAH");
  }

  /*
  sheetCorners = drawImageOnCanvasAndDetectCorners(
    canvases.videoFrame.canvas,
    canvases.detectedSheet.ctx,
    frameWidth,
    frameHeight,
    0
  );
  detectedSheetCanvasContainer = canvases.detectedSheet;

  if(sheetCorners === null){
    // rotate and try again. 0.05 seems like a good rotation, though we get some false
    // corners close to the edge, so we need to ignore those. Drawing on top of the existing image
    // works nicely as long as the sheet is not too close to the edge.
    // TODO: This may not be necessary when doing centered-above photos.
    prerotation = 0.10;
    sheetCorners = drawImageOnCanvasAndDetectCorners(
      canvases.videoFrame.canvas,
      canvases.detectedSheetRotated.ctx,
      frameWidth,
      frameHeight,
      prerotation
    );
    detectedSheetCanvasContainer = canvases.detectedSheetRotated;
  }

  if(sheetCorners === null){
    throw Error('Could not detect sheet corners');
  }

  // copy to be able to debug.
  copyCanvas(detectedSheetCanvasContainer, canvases.correctedSheetRotation);

  // extract sheet, also writes to correctedSheet canvases as intermediate steps.
  const sheetImageBW = extractSheetUsingRotationAndScaling(
    sheetCorners,
    frameWidth,
    frameHeight,
    sheetWidth,
    sheetHeight,
    prerotation,
    canvases,
  );

  // find lines to prepare for flood fill
  const jsFeatImageWithDilutedLines = timed(() => detectLines(sheetImageBW, sheetWidth, sheetHeight), 'detect lines');
  drawJsFeatImageOnContext(jsFeatImageWithDilutedLines, canvases.edges.ctx, sheetWidth, sheetHeight);

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
    canvases.filled.ctx, sheetWidth, sheetHeight
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
  */
};

export const processImage = (canvases) => {
  const startTime = new Date().getTime();
  process(canvases);
  const endTime = new Date().getTime();

  //logger.info('Finished, this took ' + (endTime - startTime) + 'ms', startTime, endTime);
};

export const processBaseline = (canvases) => {
  captureOriginalCircle(canvases.baselineVideoFrame.ctx);
};

// TODO
/*
Must make sure we capture the whole table in the photo, and remove the parts outside, to
guarantee that the sheet is inside the table area. Ideally the table should be square?
 */