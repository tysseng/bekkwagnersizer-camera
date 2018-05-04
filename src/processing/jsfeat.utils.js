import jsfeat from 'jsfeat';
import { timed } from "../utils/timer";

export const mapToImageData = (jsfeatImageData, canvasImageData) => {
  const data_u32 = new Uint32Array(canvasImageData.data.buffer);
  const alpha = (0xff << 24);

  let i = jsfeatImageData.cols * jsfeatImageData.rows, pix = 0;
  while (--i >= 0) {
    pix = jsfeatImageData.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
};

export const convertToGrayscaleJsfeatImage = (ctx, width, height) => {
  return timed(() => {
    const image_data = ctx.getImageData(0, 0, width, height);
    const grayImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
    jsfeat.imgproc.grayscale(image_data.data, width, height, grayImage);
    //writeToGrayscaleImageData(image_data, grayImage);
    return grayImage;
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