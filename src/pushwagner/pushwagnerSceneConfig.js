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

const sceneConfig: SceneConfig = {
  scenes: scenes,
  imageBitCodes: imageBitCodes,
  bitCodeToImageMap: bitCodeToImageMap,
  defaultColorMappings: getDefaultMappings(),
  colorMappings: getMappings(),
  photoColorCodes: photoColorCodes,
  bitCodeColors: getBitCodeMappings()
};

export default sceneConfig;