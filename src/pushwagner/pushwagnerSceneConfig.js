import variations from "./pushwagnerSceneVariations";
import { imageCodes, bitCodeToProfileMap } from './pushwagnerImageCodes';
import { getDefaultMappings, getMappings, photoColorCodes } from "./pushwagnerColorMaps";

export default {
  variations: variations,
  imageCodes: imageCodes,
  bitCodeToProfileMap: bitCodeToProfileMap,
  defaultColorMappings: getDefaultMappings(),
  colorMappings: getMappings(),
  photoColorCodes: photoColorCodes,
}