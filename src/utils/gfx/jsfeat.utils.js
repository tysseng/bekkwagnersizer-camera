// @flow
import jsfeat from 'jsfeat';
import { timed } from "../timer";
import type { Container, JsFeatImage } from "../../types";

export const getAverageColor = (
  image: JsFeatImage, imageWidth: number, padding: number, x: number, y: number
) => {
  let sum = 0;
  let area = (2 * padding + 1) * (2 * padding + 1);
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      sum += image.data[row * imageWidth + col];
    }
  }
  return sum / area;
};

export const mapToCanvasImageData = (jsFeatImage: JsFeatImage , canvasImageData: ImageData) => {
  const data_u32 = new Uint32Array(canvasImageData.data.buffer);
  const alpha = (0xff << 24);

  let i = jsFeatImage.cols * jsFeatImage.rows, pix = 0;
  while (--i >= 0) {
    pix = jsFeatImage.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
};

export const mapToJsFeatImageData = (source: Container): JsFeatImage => {
  const ctx = source.ctx;
  const { height, width } = source.dimensions;
  return timed(() => {
    const contextImageData = ctx.getImageData(0, 0, width, height);
    const jsFeatImageData = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
    jsfeat.imgproc.grayscale(contextImageData.data, width, height, jsFeatImageData);
    return jsFeatImageData;
  }, 'get grayscale');
};

export const rotateGrayscale180 = (image: JsFeatImage) => {
  const length = image.data.length;
  for (let i = 0; i < length / 2; i++) {
    const temp = image.data[i];
    image.data[i] = image.data[length - i];
    image.data[length - i] = temp;
  }
};