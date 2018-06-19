// @flow
import scenes from "./pushwagnerScenes";
import { imageBitCodes, bitCodeToImageMap } from './pushwagnerImageCodes';
import {
  getBitCodeMappings,
  getDefaultMappings,
  getMappings,
  photoColorCodes
} from "./pushwagnerColorMaps";
import type { Size, Point, SceneConfig } from "../types";


const sheetSizeA4: Size = {
  width: 210,
  height: 297,
};

const sheetSizeA3: Size = {
  width: 297,
  height: 410,
};

const sheetSizeMM = sheetSizeA3;

// center of logo to use for orientation detection star
const logoDetectionPositionMM: Point = {
  x: 21.4,
  y: 23.95,
};

// bounding box for removing logo, x,y is top left corner
const logoBoundingBoxMM = {
  upperLeft: {
    x: 9,
    y: 11,
  },
  size: {
    width: 92,
    height: 24
  }
};

// where to find bit dots (to indicate what image this is)
const bitPositionYMM = sheetSizeMM.height - 18;
const bitPositionsMM: Array<Point> = [
  { x: sheetSizeMM.width - 88, y: bitPositionYMM },
  { x: sheetSizeMM.width - 70, y: bitPositionYMM },
  { x: sheetSizeMM.width - 54, y: bitPositionYMM },
  { x: sheetSizeMM.width - 36, y: bitPositionYMM },
  { x: sheetSizeMM.width - 19, y: bitPositionYMM },
];

// color calibration pads position in millimeters
const colorRowsMM = [40, 85, 135, 180, 230, 290];
const colorColsMM = [80, 210];

const calibrationColorPositionsMM = {
  lightBlue: { x: colorColsMM[0], y: colorRowsMM[0] },
  green: { x: colorColsMM[0], y: colorRowsMM[1] },
  yellow: { x: colorColsMM[0], y: colorRowsMM[2] },
  purple: { x: colorColsMM[0], y: colorRowsMM[3] },
  pink: { x: colorColsMM[0], y: colorRowsMM[4] },
  white: { x: colorColsMM[0], y: colorRowsMM[5] },
  orange: { x: colorColsMM[1], y: colorRowsMM[0] },
  skin: { x: colorColsMM[1], y: colorRowsMM[1] },
  wine: { x: colorColsMM[1], y: colorRowsMM[2] },
  darkBlue: { x: colorColsMM[1], y: colorRowsMM[3] },
  black: { x: colorColsMM[1], y: colorRowsMM[4] },
};

const imageNameGenerator = (variation: string, image: Object, uuid: string) =>
  `${variation}-${image.gender}-${image.id}-${uuid}.png`;

const sceneConfig: SceneConfig = {
  id: 'pushwagnesizer',

  // Identifiers for the various artworks
  scenes: scenes,

  // bit codes - codes that tell us what version of an input sheet we've photographed
  imageBitCodes: imageBitCodes,
  imageNameGenerator,
  bitCodeToImageMap: bitCodeToImageMap,
  bitCodeColorMappings: getBitCodeMappings(),
  bitPositionsMM,

  // mapping of colors, from colors found in a photo to the colors to use for each input scene in
  // each scene,
  defaultColorMappings: getDefaultMappings(),
  colorMappings: getMappings(),
  photoColorCodes: photoColorCodes,

  // positions and sizes related to sheet that is photographed
  sheetSizeMM,
  logoDetectionPositionMM,
  logoBoundingBoxMM,
  calibrationColorPositionsMM,
};

export default sceneConfig;