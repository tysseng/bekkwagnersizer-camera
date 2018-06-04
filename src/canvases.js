import { clearCtx } from "./utils/gfx/context.utils";
import config from "./config";

const setSize = (container, { width, height }) => {
  container.canvas.width = width;
  container.canvas.height = height;
  container.dimensions = { width, height };
};

export const extractAndResizeCanvases = (all) => {

  let curr = 0;
  const canvases = {
    photoColors: { canvas: all[curr++] },
    baselineVideoFrame: { canvas: all[curr++] },
    whitePixelsVideoFrame: { canvas: all[curr++] },
    videoFrame: { canvas: all[curr++] },
    whiteCorrectedVideoFrame: { canvas: all[curr++] },
    detectedSheet: { canvas: all[curr++] },
    detectedSheetRotated: { canvas: all[curr++] },
    correctedSheetRotation: { canvas: all[curr++] },
    correctedSheetScaling: { canvas: all[curr++] },
    correctedSheetFlipping: { canvas: all[curr++] },
    bitCodeDetection: { canvas: all[curr++] },
    edges: { canvas: all[curr++] },
    removedElements: { canvas: all[curr++] },
    filledExpanded: { canvas: all[curr++] },
    filledContracted: { canvas: all[curr++] },
    mask: { canvas: all[curr++] },
    extracted: { canvas: all[curr++] },
    cropped: { canvas: all[curr++] },
    colored1: { canvas: all[curr++] },
    colored2: { canvas: all[curr++] },
    colored3: { canvas: all[curr++] },
    colored4: { canvas: all[curr++] },
    uploadable1: { canvas: all[curr++] },
    uploadable2: { canvas: all[curr++] },
    uploadable3: { canvas: all[curr++] },
    uploadable4: { canvas: all[curr++] },
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