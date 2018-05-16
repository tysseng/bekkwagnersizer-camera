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
import { removeLogo } from "./logoRemoval";
import config from "../config";
import { captureOriginalCircle, isCircleOccluded } from "./outlineOcclusionDetection";
import { readBitCode, removeBitDots } from "./bitCodeReader";
import { extractSheetUsingPerspectiveTransformation } from "./sheetExtractorExact";
import { uploadFile } from "../network/fileUploader";

const drawImageOnCanvasAndDetectCorners = (imageCanvas, ctx, width, height, rotation = 0) => {
  if (rotation !== 0) {
    timed(() => drawImageRotatedAroundCenter(imageCanvas, ctx, width, height, -rotation), 'rotate');
  } else {
    drawImageOnCanvas(imageCanvas, ctx);
  }
  const grayscaledImage = mapToJsFeatImageData(ctx, width, height);
  return detectSheetPosition(ctx, grayscaledImage, width);
};

const process = (canvases) => {

  let sheetCorners;
  let detectedSheetCanvasContainer;
  let prerotation = 0;

  const { width: frameWidth, height: frameHeight } = config.sourceSize;
  const { width: sheetWidth, height: sheetHeight } = config.sheetSize;

  /*
  const isOccluded = isCircleOccluded(canvases.videoFrame.ctx);
  if(isOccluded){
    console.log("HAND");
  } else {
    console.log("NAH");
  }*/

  sheetCorners = drawImageOnCanvasAndDetectCorners(
    canvases.videoFrame.canvas,
    canvases.detectedSheet.ctx,
    frameWidth,
    frameHeight,
    0
  );
  detectedSheetCanvasContainer = canvases.detectedSheet;

  if(sheetCorners === null){
    // rotate and try again. 0.10 seems like a good rotation,
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

  let sheetImageBW;
  if(config.exactSheetCorrection){
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

  // detect bit code to see what image this is
  timed(() => readBitCode(sheetImageBW, sheetWidth, sheetHeight, canvases), 'Reading bit code');

  // find lines to prepare for flood fill
  const jsFeatImageWithDilutedLines = timed(() => detectLines(sheetImageBW, sheetWidth, sheetHeight), 'detect lines');
  drawJsFeatImageOnContext(jsFeatImageWithDilutedLines, canvases.edges.ctx, sheetWidth, sheetHeight);

  // copy to be able to debug.
  copyCanvas(canvases.edges, canvases.removedElements);

  // remove logos and other stuff
  timed(() => removeLogo(canvases.removedElements.ctx), 'removing logo');
  timed(() => removeBitDots(canvases.removedElements.ctx), 'removing bit dots');

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

  if(config.uploadFile) uploadFile(canvases.extracted.canvas);
};

export const processImage = (canvases) => {
  timed(() => process(canvases), 'FINISHED PROCESSING IMAGE');
};

export const processBaseline = (canvases) => {
  captureOriginalCircle(canvases.baselineVideoFrame.ctx);
};

// TODO
/*
6303 - rotering feiler (roterer dobbelt?)

OUTPUT 512 x 512 PNG - padder sidene av arket for å få kvadratisk.

Defaulttype hvis vi ikke klarer å detektere kode.
Kopiere over i fellesrepo. /image

Fjerne 1px fra outline
 */