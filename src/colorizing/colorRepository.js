// @flow
import { getImageMappingsWithDefaults } from "./colorMapping";
import logger from "../utils/logger";
import type {
  BitCodeColorMap, ColorsForAllImages, HexColor, PhotoColorCodesMap, PhotoColorKey,
  SceneConfig
} from "../types";

let colorsForAllImages;
let photoColorCodes: PhotoColorCodesMap;
let bitCodeColorMappings: BitCodeColorMap;

// Must be run after color calibration
export const initColorMaps = (
  {
    scenes,
    imageBitCodes,
    defaultColorMappings,
    colorMappings,
    photoColorCodes: inputPhotoColorCodes,
    bitCodeColorMappings: inputBitCodeColorMappings
  }: SceneConfig) => {
  colorsForAllImages = getImageMappingsWithDefaults(
    colorMappings,
    defaultColorMappings,
    Object.values(imageBitCodes),
    Object.values(scenes)
  );
  photoColorCodes = inputPhotoColorCodes;
  bitCodeColorMappings = inputBitCodeColorMappings;
  logger.info('SET COLORS FOR ALL IMAGES');
  logger.info(colorsForAllImages);
};

export const getColorsForAllImages = (): ColorsForAllImages => colorsForAllImages;
export const getBitCodeColorMappings = (): BitCodeColorMap => bitCodeColorMappings;
export const getPhotoColorCodes = (): PhotoColorCodesMap => photoColorCodes;

export const getPhotoColorCodesFromKeys = (
  photoColorKeys: Array<PhotoColorKey>
): {[PhotoColorKey]: HexColor} => {
  const photoColorCodes = {};
  photoColorKeys.forEach(key => {
    photoColorCodes[key] = photoColorCodes[key];
  });
  return photoColorCodes;
};
