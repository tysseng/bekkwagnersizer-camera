import { clearCtx } from "./utils/gfx/context.utils";
import config from "./config";

const detectionContainers = [];
const processingContainers = [];
const coloredContainers = [];
const uploadContainers = [];

let currentProcessingContainer = 0;
let currentColoredContainer = 0;
let currentUploadingContainer = 0;

const setSize = (container, { width, height }) => {
  container.canvas.width = width;
  container.canvas.height = height;
  container.dimensions = { width, height };
};

export const resetCanvases = () => {
  currentProcessingContainer = 0;
  currentColoredContainer = 0;
  currentUploadingContainer = 0;
  clearCanvases();
};

export const getNextProcessingContainer = (dimensions, heading) => {
  const container = processingContainers[currentProcessingContainer++];
  setSize(container, dimensions);
  container.heading.innerHTML = heading;
  return container;
};

export const getNextColoredContainer = (dimensions, heading) => {
  const container =  coloredContainers[currentColoredContainer++];
  setSize(container, dimensions);
  container.heading.innerHTML = heading;
  return container;
};

export const getNextUploadableContainer = (dimensions, heading) => {
  const container =  uploadContainers[currentUploadingContainer++];
  setSize(container, dimensions);
  container.heading.innerHTML = heading;
  return container;
};

const getCanvasAndHeading = entry => ({
  canvas: entry.querySelector('canvas'),
  heading: entry.querySelector('h3'),
});

const setCtxs = (containers) => {
  containers.forEach(container => {
    container.ctx = container.canvas.getContext('2d');
  })
};

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
  };

  const sourceSize = config.sourceSize;
  const sheetSize = config.sheetSize;

  setSize(canvases.photoColors, sheetSize);
  setSize(canvases.baselineVideoFrame, sourceSize);
  setSize(canvases.whitePixelsVideoFrame, sourceSize);
  setSize(canvases.videoFrame, sourceSize);
  setSize(canvases.whiteCorrectedVideoFrame, sourceSize);
  setSize(canvases.detectedSheet, sourceSize);
  setSize(canvases.detectedSheetRotated, sourceSize);
  Object.keys(canvases).forEach(key => {
    canvases[key].ctx = canvases[key].canvas.getContext('2d');
  });

  for(let i=0; i<11; i++){
    processingContainers.push(getCanvasAndHeading(all[curr++]));
  }
  setCtxs(processingContainers);

  for(let i=0; i<4; i++){
    coloredContainers.push(getCanvasAndHeading(all[curr++]));
  }
  setCtxs(coloredContainers);

  for(let i=0; i<4; i++){
    uploadContainers.push(getCanvasAndHeading(all[curr++]));
  }
  setCtxs(uploadContainers);

  detectionContainers.push(canvases.videoFrame);
  detectionContainers.push(canvases.whiteCorrectedVideoFrame);
  detectionContainers.push(canvases.detectedSheet);
  detectionContainers.push(canvases.detectedSheetRotated);

  return canvases;
};

const clearCanvases = () => {
  processingContainers.forEach(container => clearCtx(container));
  coloredContainers.forEach(container => clearCtx(container));
  uploadContainers.forEach(container => clearCtx(container));
};