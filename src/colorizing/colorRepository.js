// @flow
import { getImageMappingsWithDefaults } from "./colorMapping";
import logger from "../utils/logger";
import type { SceneConfig } from "../types";

let colorsForAllImages;
let photoColorCodes;
let bitCodeColors;

// Must be run after color calibration
export const initColorMaps = (
  {
    variations,
    imageCodes,
    defaultColorMappings,
    colorMappings,
    photoColorCodes: inputPhotoColorCodes,
  }: SceneConfig) => {
  colorsForAllImages = getImageMappingsWithDefaults(
    colorMappings,
    defaultColorMappings,
    Object.values(imageCodes),
    Object.values(variations)
  );
  photoColorCodes = inputPhotoColorCodes;
  logger.info('SET COLORS FOR ALL IMAGES');
  logger.info(colorsForAllImages);
};

export const getColorsForAllImages = () => colorsForAllImages;
export const getBitCodeColors = () => bitCodeColors;
export const getPhotoColorCodes = () => photoColorCodes;

export const getPhotoColorCodesFromKeys = (photoColorKeys) => {
  const photoColorCodes = {};
  Object.keys(photoColorKeys).forEach(key => {
    photoColorCodes[key] = photoColorCodes[key];
  });
  return photoColorCodes;
};
