
import 'floodfill';
import { mapToJsFeatImageData, mapToCanvasImageData } from './jsfeat.utils';
import { detectSheetPosition } from "./sheetDetection";
import { detectLines } from "./lineDetection";
import { timed } from "../utils/timer";
import { drawImageOnCanvas, drawImageRotatedAroundCenter, floodFill } from "./draw";
import { extractSheetUsingRotationAndScaling } from "./sheetExtractorApproximate";
import { erodeMask, getMonocromeMask, removeMask } from "./mask";

const drawImageOnCanvasAndDetectCorners = (ctx, width, height, rotation = 0) => {
  if (rotation !== 0) {
    timed(() => drawImageRotatedAroundCenter(ctx, width, height, -rotation), 'rotate');
  } else {
    drawImageOnCanvas(ctx);
  }
  const grayscaledImage = mapToJsFeatImageData(ctx, width, height);
  return detectSheetPosition(ctx, grayscaledImage, width, height);
};

const process = (canvas, outputCtx, maskCtx, width, height) => {
  const ctx = canvas.getContext('2d');

  let sheetCorners;
  try {
    sheetCorners = drawImageOnCanvasAndDetectCorners(ctx, width, height, 0);
  } catch (error) {

    // if fails, rotate and try again. 0.05 seems like a good rotation, though we get some false
    // corners close to the edge, so we need to ignore those. Drawing on top of the existing image
    // works nicely as long as the sheet is not too close to the edge.
    sheetCorners = drawImageOnCanvasAndDetectCorners(ctx, width, height, 0.05);
  }

  // mutates original ctx
  const {
    sheetImageBW,
    sheetImageColorCtx,
  } = extractSheetUsingRotationAndScaling(sheetCorners, canvas, ctx, outputCtx, width, height);

  // find lines to prepare for flood fill
  const jsFeatImageWithDilutedLines = timed(() => detectLines(sheetImageBW, width, height), 'detect lines');

  // write image with lines to mask canvas to flood fill
  // TODO: See if this can be done more efficiently directly on the lineImageData.
  const lineImageData = timed(() => maskCtx.getImageData(0, 0, width, height), 'get image data');
  mapToCanvasImageData(jsFeatImageWithDilutedLines, lineImageData);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put line image to mask ctx');

  timed(() => floodFill(maskCtx, 255, 0, 0, 0.5), 'flood fill mask');

  // turn image monocrome by clearing all pixels that are not part of the mask
  const monocromeMask = timed(() => getMonocromeMask(maskCtx, width, height), 'get monocrome mask');

  // erode mask without flood fill and line detect takes 63ms, the other 200. The result is almost
  // as good.
  timed(() => erodeMask(maskCtx, lineImageData, monocromeMask, width, height), 'mask erosion 2');
  //timed(() => erodeMaskWithEdgeDetection(maskCtx, lineImageData, monocromeMask, width, height), 'mask erosion 1');

  timed(() => removeMask(maskCtx, sheetImageColorCtx, width, height), 'remove mask');

  // aaaaand once more make monocrome image by keeping transparency black and rest white, this
  // removes all inner lines.
  // use line detection
  // run dilate with black
  // remaining black portions are mask, transfer mask to original bitmap
};

export default (canvas, targetCtx, targetCtx2, width, height) => {
  const startTime = new Date().getTime();
  process(canvas, targetCtx, targetCtx2, width, height);
  const endTime = new Date().getTime();

  console.log('Finished, this took ' + (endTime - startTime) + 'ms', startTime, endTime);
}

// TODO
/*
Must make sure we capture the whole table in the photo, and remove the parts outside, to
guarantee that the sheet is inside the table area. Ideally the table should be square?
 */