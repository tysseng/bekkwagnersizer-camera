import jsfeat from 'jsfeat';
import { timed } from "../utils/timer";

export const mapToCanvasImageData = (jsFeatImageData, canvasImageData) => {
  const data_u32 = new Uint32Array(canvasImageData.data.buffer);
  const alpha = (0xff << 24);

  let i = jsFeatImageData.cols * jsFeatImageData.rows, pix = 0;
  while (--i >= 0) {
    pix = jsFeatImageData.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
};

export const mapToJsFeatImageData = (ctx, width, height) => {
  return timed(() => {
    const contextImageData = ctx.getImageData(0, 0, width, height);
    const jsFeatImageData = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
    jsfeat.imgproc.grayscale(contextImageData.data, width, height, jsFeatImageData);
    //writeToGrayscaleImageData(image_data, grayImage);
    return jsFeatImageData;
  }, 'get grayscale');
};

export const rotateGrayscale180 = (image) => {
  const length = image.data.length;
  for (let i = 0; i < length / 2; i++) {
    const temp = image.data[i];
    image.data[i] = image.data[length - i];
    image.data[length - i] = temp;
  }
};