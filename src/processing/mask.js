// @flow
import { timed } from "../utils/timer";
import jsfeat from 'jsfeat';
import { subMatrixTouchesMask } from "./edgeDetection";
import { mapToCanvasImageData } from "../utils/gfx/jsfeat.utils";
import { getNextProcessingContainer } from "../canvases";
import config from "../config";
import type { Container, JsFeatImage } from "../types";

// TODO: Must be possible to do this faster, directly in a monocrome image
export const getMonocromeMask = (container: Container): JsFeatImage => {
  const ctx = container.ctx;
  const { width, height } = container.size;
  const maskImage = ctx.getImageData(0, 0, width, height);
  const data = maskImage.data;

  for (let i = 0; i < width * height * 4; i += 4) {
    if (data[i + 3] === 255) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  const grayImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(maskImage.data, width, height, grayImage);
  return grayImage;
};


export const getErodedMask = (edgesContainer: Container, monocromeMask: JsFeatImage): Container => {
  const maskContainer = getNextProcessingContainer(config.sheetSize, 'Mask');
  const maskCtx = maskContainer.ctx;
  const {width, height} = maskContainer.size;


  const erosionWidth = 1; // must be same as dilution width;
  const maskColor = 255;
  const erodedMask = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);

  for (let x = erosionWidth; x < width - erosionWidth; x++) {
    for (let y = erosionWidth; y < height - erosionWidth; y++) {
      const color = subMatrixTouchesMask(monocromeMask, x, y, width, maskColor) ? maskColor : 0;
      erodedMask.data[y * width + x] = color;
      // TODO: This can be done directly on the target image.
    }
  }

  const edgesCtx = edgesContainer.ctx;
  const lineImageData = edgesCtx.getImageData(0, 0, width, height);
  mapToCanvasImageData(erodedMask, lineImageData);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put eroded line image to mask ctx');
  return maskContainer;
};

// TODO: Faster to do this from a greyscale matrix, not a ctx?
export const removeMask = (maskContainer: Container, containerToFilter: Container): Container => {

  const maskCtx = maskContainer.ctx;
  const ctxToFilter = containerToFilter.ctx;

  const filteredContainer = getNextProcessingContainer(containerToFilter.size, 'Filtered image');
  const filteredCtx = filteredContainer.ctx;
  const { width, height } = maskContainer.size;

  const mask = maskCtx.getImageData(0, 0, width, height);
  const image = ctxToFilter.getImageData(0, 0, width, height);
  const maskData = mask.data;
  const imageData = image.data;

  for (let i = 0; i < width * height * 4; i += 4) {
    if (maskData[i] === 255 && maskData[i + 1] === 255 && maskData[i + 2] === 255) {
      imageData[i + 3] = 0;
    }
  }

  filteredCtx.putImageData(image, 0, 0);
  return filteredContainer;
};