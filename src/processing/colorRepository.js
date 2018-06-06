import { getImageMappingsWithDefaults } from "./colorMapping";
import logger from "../utils/logger";

let colorsForAllImages;
let photoColors;

// Must be run after color calibration
export const initColorMaps = (
  {
    variations,
    imageCodes,
    defaultColorMappings,
    colorMappings,
    photoColorCodes
  }) => {
  colorsForAllImages = getImageMappingsWithDefaults(
    colorMappings,
    defaultColorMappings,
    Object.values(imageCodes),
    Object.values(variations)
  );
  photoColors = photoColorCodes;
  logger.info('SET COLORS FOR ALL IMAGES');
  logger.info(colorsForAllImages);
};

export const getColorsForAllImages = () => colorsForAllImages;
export const getPhotoColors = () => photoColors;
