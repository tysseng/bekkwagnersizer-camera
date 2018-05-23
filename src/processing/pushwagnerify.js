import nearest from 'nearest-color';

const color = (hexString) => {
  return {
    r: parseInt(hexString.substring(1, 2)),
    g: parseInt(hexString.substring(3, 4)),
    b: parseInt(hexString.substring(5, 6)),
  }
};

// White is not very white in photo, so to get a better color detection we detect it as yellowish-grey
// but write it as pure blenda white.
const colorsInPhoto = {
  white: '#eeeade',
  pink: '#ffc9de',
  black: '#000000',
  yellow: '#fffb00',
  blue: '#1115ff',
};

const colorMap = {
  [colorsInPhoto.white]: color('#ffffff'),
  [colorsInPhoto.pink]: color(colorsInPhoto.pink),
  [colorsInPhoto.black]: color(colorsInPhoto.black),
  [colorsInPhoto.yellow]: color(colorsInPhoto.yellow),
  [colorsInPhoto.blue]: color(colorsInPhoto.blue),
};

const nearestPhotoColor = nearest.from(colorsInPhoto);

export const correctColors = (container) => {

  const { width, height } = container.dimensions;
  const ctx = container.ctx;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const dataLength = height * width * 4;

  for (let i = 0; i < dataLength; i += 4) {
    if(data[i+3] > 0) {
      const oldColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
      const color = colorMap[nearestPhotoColor(oldColor)];
      data[i] = color.rgb.r;
      data[i + 1] = color.rgb.g;
      data[i + 2] = color.rgb.b;
    }
  }

  ctx.putImageData(imageData, 0, 0);

};