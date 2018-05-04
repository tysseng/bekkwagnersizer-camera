import jsfeat from 'jsfeat';

const dilutionWidth = 1;

export const detectAndDiluteLines = (image, width, height) => {
  jsfeat.imgproc.canny(image, image, 30, 60);
  return diluteLines(image, width, height, 255, dilutionWidth);
};

// This only works with a 3x3 matrix but is slightly faster than the one above.
const fillSubMatrix = (image, targetImage, x, y, width, color) => {
  let col = x - 1;
  let row = y;
  targetImage.data[row * width + col] = color; // can be done more efficiently

  col++;
  row = y-1;
  targetImage.data[(row++) * width + col] = color; // can be done more efficiently
  targetImage.data[(row++) * width + col] = color; // can be done more efficiently
  targetImage.data[(row) * width + col] = color; // can be done more efficiently
  col++;
  targetImage.data[(y) * width + col] = color; // can be done more efficiently
};

export const diluteLines = (image, width, height, color, dilutionWidth) => {
  const targetImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  for (let x = dilutionWidth; x < width - dilutionWidth; x++) {
    for (let y = dilutionWidth; y < height - dilutionWidth; y++) {
      if(image.data[y * width + x] === 255) {
        fillSubMatrix(image, targetImage, x, y, width, color);
      }
    }
  }
  return targetImage;
};

export const subMatrixTouchesMask2 = (image, x, y, width, maskColor, erosionWidth) => {
  for (let col = x - erosionWidth; col <= x + erosionWidth; col++) {
    for (let row = y - erosionWidth; row <= y + erosionWidth; row++) {
      if(image.data[row * width + col] === maskColor){
        return true;
      }
    }
  }
  return false;
};

// This only works with a 3x3 matrix but is slightly faster than the one above
export const subMatrixTouchesMask = (image, x, y, width, maskColor, erosionWidth) => {
  let col = x - 1;
  let row = y;
  if(image.data[row * width + col] === maskColor) return true;

  col++;
  row = y-1;
  if(image.data[(row++) * width + col] === maskColor) return true;
  if(image.data[(row++) * width + col] === maskColor) return true;
  if(image.data[(row) * width + col] === maskColor) return true;
  col++;
  if(image.data[(y) * width + col] === maskColor) return true;

  return false;
};