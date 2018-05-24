// White is not very white in photo, so to get a better color detection we detect it as yellowish-grey
// but write it as pure blenda white.
export const colorsInPhoto = {
  white: '#e1e2e9',
  pink: '#ffc9de',
  black: '#000000',
  yellow: '#fffb00',
  blue: '#1115ff',
};

const color = (hexString) => {

  return {
    r: parseInt(hexString.substring(1, 3), 16),
    g: parseInt(hexString.substring(3, 5), 16),
    b: parseInt(hexString.substring(5, 7), 16),
  }
};

const colorMapNormal = {
  [colorsInPhoto.white]: color('#ffffff'),
  [colorsInPhoto.pink]: color(colorsInPhoto.pink),
  [colorsInPhoto.black]: color(colorsInPhoto.black),
  [colorsInPhoto.yellow]: color(colorsInPhoto.yellow),
  [colorsInPhoto.blue]: color(colorsInPhoto.blue),
};

const colorMapGreenish = {
  [colorsInPhoto.white]: color('#ffffff'),
  [colorsInPhoto.pink]: color(colorsInPhoto.pink),
  [colorsInPhoto.black]: color(colorsInPhoto.black),
  [colorsInPhoto.yellow]: color("#00ff00"),
  [colorsInPhoto.blue]: color("#007700"),
};

const colorMapReddish = {
  [colorsInPhoto.white]: color('#ffffff'),
  [colorsInPhoto.pink]: color(colorsInPhoto.pink),
  [colorsInPhoto.black]: color(colorsInPhoto.black),
  [colorsInPhoto.yellow]: color("#ff0000"),
  [colorsInPhoto.blue]: color("#990000"),
};

const colorMapBlueish = {
  [colorsInPhoto.white]: color('#ffffff'),
  [colorsInPhoto.pink]: color(colorsInPhoto.pink),
  [colorsInPhoto.black]: color(colorsInPhoto.black),
  [colorsInPhoto.yellow]: color("#0000ff"),
  [colorsInPhoto.blue]: color("#000099"),
};

export const colorMaps = [
  colorMapNormal,
  colorMapGreenish,
  colorMapReddish,
  colorMapBlueish,
];
