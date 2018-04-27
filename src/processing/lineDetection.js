import jsfeat from 'jsfeat';

const dilutionWidth = 1;

export const detectAndDiluteLines = (image, width, height) => {
  jsfeat.imgproc.canny(image, image, 30, 60);
  return diluteLines(image, width, height, 255, dilutionWidth);
};

// TODO: Circular dilute
const fillSubMatrix = (image, targetImage, x, y, width, color, dilutionWidth) => {
  for (let col = x - dilutionWidth; col <= x + dilutionWidth; col++) {
    for (let row = y - dilutionWidth; row <= y + dilutionWidth; row++) {
      targetImage.data[row * width + col] = color; // can be done more efficiently
    }
  }
};

export const diluteLines = (image, width, height, color, dilutionWidth) => {
  const targetImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  for (let x = dilutionWidth; x < width - dilutionWidth; x++) {
    for (let y = dilutionWidth; y < height - dilutionWidth; y++) {
      if(image.data[y * width + x] === 255) {
        fillSubMatrix(image, targetImage, x, y, width, color, dilutionWidth);
      }
    }
  }
  return targetImage;
};

export const subMatrixTouchesMask = (image, x, y, width, maskColor, erosionWidth) => {
  for (let col = x - erosionWidth; col <= x + erosionWidth; col++) {
    for (let row = y - erosionWidth; row <= y + erosionWidth; row++) {
      if(image.data[row * width + col] === maskColor){
        return true;
      }
    }
  }
  return false;
};