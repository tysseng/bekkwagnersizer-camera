// @flow
import { clearCtx } from "./utils/gfx/canvas.utils";
import config from "./config";
import type { Container, Containers, Size } from "./types";
import logger from "./utils/logger";

const processingContainers: Array<Container> = [];
const coloredContainers: Array<Container> = [];
const uploadContainers: Array<Container> = [];

let processingCanvasesDiv;
let coloredCanvasesDiv;
let uploadableCanvasesDiv;

let currentProcessingContainer = 0;
let currentColoredContainer = 0;
let currentUploadingContainer = 0;

const setSize = (container: Container, { width, height }: Size) => {
  container.canvas.width = width;
  container.canvas.height = height;
  container.size = { width, height };
};

const clearCanvases = () => {
  processingContainers.forEach(container => clearCtx(container));
  coloredContainers.forEach(container => clearCtx(container));
  uploadContainers.forEach(container => clearCtx(container));
};

export const resetCanvases = () => {
  currentProcessingContainer = 0;
  currentColoredContainer = 0;
  currentUploadingContainer = 0;
  clearCanvases();
};


const createContainer = (wrapper: HTMLElement, size: Size): Container => {
  const div = document.createElement('div');
  const heading = document.createElement('h3');
  const canvas = document.createElement('canvas');
  div.appendChild(heading);
  div.appendChild(canvas);
  wrapper.appendChild(div);

  canvas.height = size.height;
  canvas.width = size.width;
  const ctx = canvas.getContext('2d');

  return {
    canvas,
    ctx,
    heading,
    size
  };
};

const getContainer = (
  wrapper: HTMLElement,
  size: Size,
  heading: string,
  containers: Array<Container>,
  index: number
): Container => {
  console.log(containers, index)
  const existingContainer = containers[index];
  if (existingContainer) {
    setSize(existingContainer, size);
    existingContainer.heading.innerHTML = heading;
    logger.info(`Returning existing container - ${heading}`);
    return existingContainer;
  } else {
    const container = createContainer(wrapper, size);
    container.heading.innerHTML = heading;
    containers[index] = container;
    logger.info(`Creating new container - ${heading}`);
    return container;
  }
};

const getAsContainer = (entry: HTMLElement, size: Size): Container => {
  const canvas = entry.querySelector('canvas');
  if (canvas instanceof HTMLCanvasElement) {
    canvas.height = size.height;
    canvas.width = size.width;
    const ctx = canvas.getContext('2d');
    const heading = entry.querySelector('h3');
    if (heading === null) {
      throw Error('All containers require a heading element.');
    }
    return {
      canvas,
      ctx,
      heading,
      size
    };
  }
  throw Error('trying to init a non existing container');
};

export const getNextProcessingContainer = (size: Size, heading: string): Container => {
  return getContainer(processingCanvasesDiv, size, heading, processingContainers, currentProcessingContainer++);
};

export const getNextColoredContainer = (size: Size, heading: string): Container => {
  return getContainer(coloredCanvasesDiv, size, heading, coloredContainers, currentColoredContainer++);
};

export const getNextUploadableContainer = (size: Size, heading: string): Container => {
  return getContainer(uploadableCanvasesDiv, size, heading, uploadContainers, currentUploadingContainer++);
};

export const extractAndResizeCanvases = (
  all: NodeList<HTMLElement>,
  processingCanvases: HTMLElement,
  coloredCanvases: HTMLElement,
  uploadableCanvases: HTMLElement,
): Containers => {
  processingCanvasesDiv = processingCanvases;
  coloredCanvasesDiv = coloredCanvases;
  uploadableCanvasesDiv = uploadableCanvases;
  let curr = 0;
  const sourceSize = config.sourceSize;
  const sheetSize = config.sheetSize;

  return {
    photoColors: getAsContainer(all[curr++], sheetSize),
    baselineVideoFrame: getAsContainer(all[curr++], sourceSize),
    whitePixelsVideoFrame: getAsContainer(all[curr++], sourceSize),
    videoFrame: getAsContainer(all[curr++], sourceSize),
  };
};
