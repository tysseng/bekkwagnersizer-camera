// @flow
import scenes from "./pushwagnerScenes";
import { imageBitCodes, bitCodeToImageMap } from './pushwagnerImageCodes';
import {
  getBitCodeMappings,
  getDefaultMappings,
  getMappings,
  photoColorCodes
} from "./pushwagnerColorMaps";
import type { SceneConfig } from "../types";


const sheetSizeA4: Dimensions = {
  width: 210,
  height: 297,
};

const sheetSizeA3: Dimensions = {
  width: 297,
  height: 410,
};

const sheetSizeMM = sheetSizeA3;

// where to find bit dots (to indicate what image this is)
const bitPositionYMM = sheetSizeMM.height - 18;
const bitPositionsMM: Array<Point> = [
  { x: sheetSizeMM.width - 88, y: bitPositionYMM },
  { x: sheetSizeMM.width - 70, y: bitPositionYMM },
  { x: sheetSizeMM.width - 54, y: bitPositionYMM },
  { x: sheetSizeMM.width - 36, y: bitPositionYMM },
  { x: sheetSizeMM.width - 19, y: bitPositionYMM },
];

const sceneConfig: SceneConfig = {
  scenes: scenes,
  imageBitCodes: imageBitCodes,
  bitCodeToImageMap: bitCodeToImageMap,
  defaultColorMappings: getDefaultMappings(),
  colorMappings: getMappings(),
  photoColorCodes: photoColorCodes,
  bitCodeColorMappings: getBitCodeMappings(),
  bitPositionsMM,
  sheetSizeMM,
};

export default sceneConfig;