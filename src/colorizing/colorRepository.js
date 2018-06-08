// @flow
import { getImageMappingsWithDefaults } from "./colorMapping";
import logger from "../utils/logger";
import type { ColorCode, PhotoColorKey, SceneConfig } from "../types";

let colorsForAllImages;
let photoColorCodes;
let bitCodeColorMappings;

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

export const getColorsForAllImages = () => colorsForAllImages;
export const getBitCodeColorMappings = () => bitCodeColorMappings;
export const getPhotoColorCodes = () => photoColorCodes;

export const getPhotoColorCodesFromKeys = (
  photoColorKeys: Array<PhotoColorKey>
): {[PhotoColorKey]: ColorCode} => {
  const photoColorCodes = {};
  photoColorKeys.forEach(key => {
    photoColorCodes[key] = photoColorCodes[key];
  });
  return photoColorCodes;
};
