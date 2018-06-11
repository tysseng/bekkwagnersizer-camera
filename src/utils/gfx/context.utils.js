// @flow
import { timed } from "../timer";
import type { Container, Point, RgbColor } from "../../types";

export const rotateColor180 = (data: Uint8ClampedArray, length: number) => {
  for (let i = 0; i < length / 2; i += 4) {
    const temp1 = data[i];
    const temp2 = data[i + 1];
    const temp3 = data[i + 2];
    const temp4 = data[i + 3];
    data[i] = data[length - i];
    data[i + 1] = data[length - i + 1];
    data[i + 2] = data[length - i + 2];
    data[i + 3] = data[length - i + 3];
    data[length - i] = temp1;
    data[length - i + 1] = temp2;
    data[length - i + 2] = temp3;
    data[length - i + 3] = temp4;
  }
};

export const copyCanvas = (source: Container, target: Container) => {
  timed(() => target.ctx.drawImage(source.canvas, 0, 0), 'Copying canvas');
};

export const copyCanvasCentered = (source: Container, target: Container) => {

  const {width: sourceWidth, height: sourceHeight} = source.dimensions;
  const {width: targetWidth, height: targetHeight} = target.dimensions;

  const offsetX = Math.floor((targetWidth - sourceWidth) / 2);
  const offsetY = Math.floor((targetHeight - sourceHeight) / 2);

  timed(() => target.ctx.drawImage(source.canvas, offsetX, offsetY), 'Copying canvas centered');
};

export const getPointColorFromImageData = (
  data: Uint8ClampedArray, point: Point, width: number
): RgbColor => {
  const i = (point.y * width + point.x) * 4;
  return {
    r: data[i],
    g: data[i+1],
    b: data[i+2],
  }
};

export const clearCtx = (container: Container) => {
  const ctx = container.ctx;
  const { width, height } = container.dimensions;
  ctx.clearRect(0, 0, width, height);
};
