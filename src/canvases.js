// @flow
import { clearCtx } from "./utils/gfx/context.utils";
import config from "./config";
import type { Container, Containers, Dimensions } from "./types";

const detectionContainers: Array<Container> = [];
const processingContainers: Array<Container> = [];
const coloredContainers: Array<Container> = [];
const uploadContainers: Array<Container> = [];

let currentProcessingContainer = 0;
let currentColoredContainer = 0;
let currentUploadingContainer = 0;

const setSize = (container: Container, { width, height }: Dimensions) => {
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

export const getNextProcessingContainer = (dimensions: Dimensions, heading: string): Container => {
  const container = processingContainers[currentProcessingContainer++];
  setSize(container, dimensions);
  container.heading.innerHTML = heading;
  return container;
};

export const getNextColoredContainer = (dimensions: Dimensions, heading: string): Container => {
  const container = coloredContainers[currentColoredContainer++];
  setSize(container, dimensions);
  container.heading.innerHTML = heading;
  return container;
};

export const getNextUploadableContainer = (dimensions: Dimensions, heading: string): Container => {
  const container = uploadContainers[currentUploadingContainer++];
  setSize(container, dimensions);
  container.heading.innerHTML = heading;
  return container;
};

const getAsContainer = (entry: HTMLElement, dimensions: Dimensions): Container => {
  const canvas = entry.querySelector('canvas');
  if (canvas instanceof HTMLCanvasElement) {
    canvas.height = dimensions.height;
    canvas.width = dimensions.width;
    const ctx = canvas.getContext('2d');
    const heading = entry.querySelector('h3');
    if(heading === null){
      throw Error('All containers require a heading element.');
    }
    return {
      canvas,
      ctx,
      heading,
      dimensions
    };
  }
  throw Error('trying to init a non existing container');
};

export const extractAndResizeCanvases = (all: NodeList<HTMLElement>): Containers => {
  let curr = 0;
  const sourceSize = config.sourceSize;
  const sheetSize = config.sheetSize;

  const canvases = {
    photoColors: getAsContainer(all[curr++], sheetSize),
    baselineVideoFrame: getAsContainer(all[curr++], sourceSize),
    whitePixelsVideoFrame: getAsContainer(all[curr++], sourceSize),
    videoFrame: getAsContainer(all[curr++], sourceSize),
    whiteCorrectedVideoFrame: getAsContainer(all[curr++], sourceSize),
    detectedSheet: getAsContainer(all[curr++], sourceSize),
    detectedSheetRotated: getAsContainer(all[curr++], sourceSize),
  };

  for (let i = 0; i < 11; i++) {
    processingContainers.push(getAsContainer(all[curr++], sheetSize));
  }

  for (let i = 0; i < 4; i++) {
    coloredContainers.push(getAsContainer(all[curr++], sheetSize));
  }

  for (let i = 0; i < 4; i++) {
    uploadContainers.push(getAsContainer(all[curr++], sheetSize));
  }

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