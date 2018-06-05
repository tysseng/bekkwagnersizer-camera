import jsfeat from 'jsfeat';
import { drawJsFeatImageOnContext } from "../utils/gfx/draw";

const dilutionWidth = 1;

// Detect all lines in image. Lines are diluted to plug single pixel holes before flow filling
export const detectEdges = (container, canvases) => {
  const image = container.gray;
  const { height, width } = container.dimensions;
  jsfeat.imgproc.canny(image, image, 30, 60);
  const grayDilutedLines = diluteLines(image, width, height, 255, dilutionWidth);

  const targetContainer = canvases.edges;
  drawJsFeatImageOnContext(grayDilutedLines, targetContainer);
  return targetContainer;
};

const diluteLines = (image, width, height, color, dilutionWidth) => {
  const imageWithDilutedLines = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  for (let x = dilutionWidth; x < width - dilutionWidth; x++) {
    for (let y = dilutionWidth; y < height - dilutionWidth; y++) {
      if (image.data[y * width + x] === 255) {
        fillSubMatrix(image, imageWithDilutedLines, x, y, width, color);
      }
    }
  }
  return imageWithDilutedLines;
};

// This only works with a 3x3 matrix but is slightly faster than the one above.
const fillSubMatrix = (image, targetImage, x, y, width, color) => {
  let col = x - 1;
  let row = y;
  targetImage.data[row * width + col] = color; // can be done more efficiently

  col++;
  row = y - 1;
  targetImage.data[(row++) * width + col] = color; // can be done more efficiently
  targetImage.data[(row++) * width + col] = color; // can be done more efficiently
  targetImage.data[(row) * width + col] = color; // can be done more efficiently
  col++;
  targetImage.data[(y) * width + col] = color; // can be done more efficiently
};

// This only works with a 3x3 matrix but is slightly faster than the one above
export const subMatrixTouchesMask = (image, x, y, width, maskColor) => {
  let col = x - 1;
  let row = y;
  if (image.data[row * width + col] === maskColor) return true;

  col++;
  row = y - 1;
  if (image.data[(row++) * width + col] === maskColor) return true;
  if (image.data[(row++) * width + col] === maskColor) return true;
  if (image.data[(row) * width + col] === maskColor) return true;
  col++;
  if (image.data[(y) * width + col] === maskColor) return true;

  return false;
};