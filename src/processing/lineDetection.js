import jsfeat from 'jsfeat';

export const detectLines = (image, width, height) => {
  jsfeat.imgproc.canny(image, image, 30, 60);
  return diluteLines(image, width, height);
};

const dilutionWidth = 1;

// TODO: Circular dilute
const fillSubMatrix = (image, targetImage, x, y, width) => {
  for (let col = x - dilutionWidth; col <= x + dilutionWidth; col++) {
    for (let row = y - dilutionWidth; row <= y + dilutionWidth; row++) {
      targetImage.data[row * width + col] = 255; // can be done more efficiently
    }
  }
};

export const diluteLines = (image, width, height) => {
  const targetImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  for (let x = dilutionWidth; x < width - dilutionWidth; x++) {
    for (let y = dilutionWidth; y < height - dilutionWidth; y++) {
      if(image.data[y * width + x] === 255) {
        fillSubMatrix(image, targetImage, x, y, width);
      }
    }
  }
  return targetImage;
};

// dilute lines
// fill. Make mask.
// detect new lines
// move along lines with transparency mask tilsvarende dilute mask og contract igjen. Så lenge line
// detect er gjort på mask så burde dette funke (