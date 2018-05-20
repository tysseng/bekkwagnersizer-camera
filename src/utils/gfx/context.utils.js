import { timed } from "../timer";

export const rotateColor180 = (data, length) => {
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

export const copyCanvas = (source, target) => {
  timed(() => target.ctx.drawImage(source.canvas, 0, 0), 'Copying canvas');
};

export const getColorFromImageData = (data, point, width) => {
  const i = (point.y * width + point.x) * 4;
  return {
    r: data[i],
    g: data[i+1],
    b: data[i+2],
  }
};