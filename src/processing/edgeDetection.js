// @flow
import jsfeat from 'jsfeat';
import { drawJsFeatImageOnContext } from "../utils/gfx/draw";
import type { Container, Size, JsFeatImage } from "../types";
import { getNextProcessingContainer } from "../canvases";
import config from "../config";

const dilutionWidth = 1;

// Detect all lines in image. Lines are diluted to plug single pixel holes before flow filling
export const detectEdges = (container: Container): Container => {
  const image = container.gray;
  if(image == null){
    throw Error('Gray scale image is missing for some reason. It shouldnt be.');
  }
  jsfeat.imgproc.canny(image, image, 30, 60);
  const grayDilutedLines = diluteLines(image, container.size, 255, dilutionWidth);

  const targetContainer = getNextProcessingContainer(container.size, 'Edge detection');
  drawJsFeatImageOnContext(grayDilutedLines, targetContainer);
  return targetContainer;
};

const diluteLines = (
  image: JsFeatImage,
  { width, height }: Size,
  grayscaleColor: number,
  dilutionWidth: number
): JsFeatImage => {
  const imageWithDilutedLines = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  for (let x = dilutionWidth; x < width - dilutionWidth; x++) {
    for (let y = dilutionWidth; y < height - dilutionWidth; y++) {
      if (image.data[y * width + x] === 255) {
        fillSubMatrix(image, imageWithDilutedLines, x, y, width, grayscaleColor);
      }
    }
  }
  return imageWithDilutedLines;
};

// This only works with a 3x3 matrix but is slightly faster than the one above.
const fillSubMatrix = (
  image: JsFeatImage,
  targetImage: JsFeatImage,
  x: number,
  y: number,
  width: number,
  grayscaleColor: number
) => {
  let col = x - 1;
  let row = y;
  targetImage.data[row * width + col] = grayscaleColor; // can be done more efficiently

  col++;
  row = y - 1;
  targetImage.data[(row++) * width + col] = grayscaleColor; // can be done more efficiently
  targetImage.data[(row++) * width + col] = grayscaleColor; // can be done more efficiently
  targetImage.data[(row) * width + col] = grayscaleColor; // can be done more efficiently
  col++;
  targetImage.data[(y) * width + col] = grayscaleColor; // can be done more efficiently
};

// This only works with a 3x3 matrix but is slightly faster than the one above
export const subMatrixTouchesMask = (
  image: JsFeatImage,
  x: number,
  y: number,
  width: number,
  grayscaleMaskColor: number
): boolean => {
  let col = x - 1;
  let row = y;
  if (image.data[row * width + col] === grayscaleMaskColor) return true;

  col++;
  row = y - 1;
  if (image.data[(row++) * width + col] === grayscaleMaskColor) return true;
  if (image.data[(row++) * width + col] === grayscaleMaskColor) return true;
  if (image.data[(row) * width + col] === grayscaleMaskColor) return true;
  col++;
  if (image.data[(y) * width + col] === grayscaleMaskColor) return true;

  return false;
};