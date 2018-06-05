import { clearCtx } from "./utils/gfx/context.utils";
import config from "./config";

const setSize = (container, { width, height }) => {
  container.canvas.width = width;
  container.canvas.height = height;
  container.dimensions = { width, height };
};

export const getCanvasAndHeading = entry => ({
  canvas: entry.querySelector('canvas'),
  heading: entry.querySelector('h3'),
});

export const extractAndResizeCanvases = (all) => {

  let curr = 0;
  const canvases = {
    photoColors: getCanvasAndHeading(all[curr++]),
    baselineVideoFrame: getCanvasAndHeading(all[curr++]),
    whitePixelsVideoFrame: getCanvasAndHeading(all[curr++]),
    videoFrame: getCanvasAndHeading(all[curr++]),
    whiteCorrectedVideoFrame: getCanvasAndHeading(all[curr++]),
    detectedSheet: getCanvasAndHeading(all[curr++]),
    detectedSheetRotated: getCanvasAndHeading(all[curr++]),
    correctedSheetRotation: getCanvasAndHeading(all[curr++]),
    correctedSheetScaling: getCanvasAndHeading(all[curr++]),
    correctedSheetFlipping: getCanvasAndHeading(all[curr++]),
    bitCodeDetection: getCanvasAndHeading(all[curr++]),
    edges: getCanvasAndHeading(all[curr++]),
    removedElements: getCanvasAndHeading(all[curr++]),
    filledExpanded: getCanvasAndHeading(all[curr++]),
    filledContracted: getCanvasAndHeading(all[curr++]),
    mask: getCanvasAndHeading(all[curr++]),
    extracted: getCanvasAndHeading(all[curr++]),
    cropped: getCanvasAndHeading(all[curr++]),
    colored1: getCanvasAndHeading(all[curr++]),
    colored2: getCanvasAndHeading(all[curr++]),
    colored3: getCanvasAndHeading(all[curr++]),
    colored4: getCanvasAndHeading(all[curr++]),
    uploadable1: getCanvasAndHeading(all[curr++]),
    uploadable2: getCanvasAndHeading(all[curr++]),
    uploadable3: getCanvasAndHeading(all[curr++]),
    uploadable4: getCanvasAndHeading(all[curr++]),
  };

  const sourceSize = config.sourceSize;
  const sheetSize = config.sheetSize;
  const uploadSize = config.uploadSize;
  const croppedSize = {
    width: sheetSize.width - 2 * config.finalCrop,
    height: sheetSize.height - 2 * config.finalCrop
  };

  setSize(canvases.photoColors, sheetSize);
  setSize(canvases.baselineVideoFrame, sourceSize);
  setSize(canvases.whitePixelsVideoFrame, sourceSize);
  setSize(canvases.videoFrame, sourceSize);
  setSize(canvases.whiteCorrectedVideoFrame, sourceSize);
  setSize(canvases.detectedSheet, sourceSize);
  setSize(canvases.detectedSheetRotated, sourceSize);
  setSize(canvases.correctedSheetRotation, sourceSize);
  setSize(canvases.correctedSheetScaling, sheetSize);
  setSize(canvases.correctedSheetFlipping, sheetSize);
  setSize(canvases.bitCodeDetection, sheetSize);
  setSize(canvases.edges, sheetSize);
  setSize(canvases.removedElements, sheetSize);
  setSize(canvases.filledExpanded, {
    width: sheetSize.width + 10,
    height: sheetSize.height + 10
  });
  setSize(canvases.filledContracted, sheetSize);
  setSize(canvases.mask, sheetSize);
  setSize(canvases.extracted, sheetSize);
  setSize(canvases.cropped, croppedSize);
  setSize(canvases.colored1, croppedSize);
  setSize(canvases.colored2, croppedSize);
  setSize(canvases.colored3, croppedSize);
  setSize(canvases.colored4, croppedSize);
  setSize(canvases.uploadable1, uploadSize);
  setSize(canvases.uploadable2, uploadSize);
  setSize(canvases.uploadable3, uploadSize);
  setSize(canvases.uploadable4, uploadSize);
  Object.keys(canvases).forEach(key => {
    canvases[key].ctx = canvases[key].canvas.getContext('2d');
  });

  return canvases;
};

export const clearCanvases = (canvases) => {
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