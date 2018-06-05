import { timed } from "../utils/timer";
import jsfeat from 'jsfeat';
import { detectEdges, subMatrixTouchesMask } from "./edgeDetection";
import { mapToCanvasImageData } from "../utils/gfx/jsfeat.utils";
import { floodFill } from "../utils/gfx/draw";

// TODO: Must be possible to do this faster, directly in a monocrome image
export const getMonocromeMask = (container) => {
  const ctx = container.ctx;
  const { width, height } = container.dimensions;
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


export const getErodedMask = (edgesContainer, monocromeMask, canvases) => {
  const maskContainer = canvases.mask;
  const maskCtx = maskContainer.ctx;
  const edgesCtx = edgesContainer.ctx;
  const {width, height} = maskContainer.dimensions;

  const lineImageData = edgesCtx.getImageData(0, 0, width, height);
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

  mapToCanvasImageData(erodedMask, lineImageData);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put eroded line image to mask ctx');
  return maskContainer;
};

// TODO: Faster to do this from a greyscale matrix, not a ctx?
export const removeMask = (maskContainer, containerToFilter, canvases) => {

  const maskCtx = maskContainer.ctx;
  const ctxToFilter = containerToFilter.ctx;

  const filteredContainer = canvases.extracted;
  const filteredCtx = filteredContainer.ctx;
  const { width, height } = maskContainer.dimensions;

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

export const erodeMaskWithEdgeDetection = (maskCtx, lineImageData, monocromeMask, width, height) => {

  // erode mask, removing the pixels that were added by diluting the original lines. This works
  // by detecting the new mask outline, which is exactly one dilute distance from the real line. As
  // dilute works in both directions, a second dilute will reclaim the missing pixels without
  // going into the holes that were plugged by the original dilute.
  const maskOutline = timed(() => detectEdges(monocromeMask, width, height), 'erode mask');
  mapToCanvasImageData(maskOutline, lineImageData);
  timed(() => maskCtx.putImageData(lineImageData, 0, 0), 'put eroded line image to mask ctx');
  timed(() => floodFill(maskCtx, 255, 255, 255, 0), 'flood fill mask again');
};
