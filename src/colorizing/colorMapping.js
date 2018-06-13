//flow
import type {
  BitCode, ColorsForAllImages, ColorsForAllScenes,
  ImageToSceneColorsMap, PhotoColorKey, RgbColor, SceneColorCodes, SceneKey,
  SceneToColorCodesMap
} from "../types";

export const color = (hexString: string): RgbColor => {
  return {
    r: parseInt(hexString.substring(1, 3), 16),
    g: parseInt(hexString.substring(3, 5), 16),
    b: parseInt(hexString.substring(5, 7), 16),
  }
};

// Gets a mapping from detected color (by name) in the photo to color hex code in a scene.
const getSceneColorsFromPhotoColorKeys = (
  photoColors: Array<PhotoColorKey>,
  variationColors: SceneColorCodes,
  defaultVariationColors: SceneColorCodes,
): SceneColorCodes => {
  const screenColors = {};
  if (variationColors == null) {
    photoColors.forEach(color => {
      screenColors[color] = defaultVariationColors[color];
    });
  } else {
    photoColors.forEach(color => {
      if (variationColors[color]) {
        screenColors[color] = variationColors[color];
      } else {
        screenColors[color] = defaultVariationColors[color];
      }
    });
  }
  return screenColors;
};

const getSceneColorsForImage = (
  mappings: ImageToSceneColorsMap,
  defaultMappings: SceneToColorCodesMap,
  imageCode: BitCode,
  sceneKey: SceneKey,
): SceneColorCodes => {
  const photoColors = mappings[imageCode].photo;
  const sceneColors = mappings[imageCode][sceneKey];
  const defaultSceneColors = defaultMappings[sceneKey];
  return getSceneColorsFromPhotoColorKeys(photoColors, sceneColors, defaultSceneColors);
};

const getVariationMappingsWithDefaults = (
  mappings: ImageToSceneColorsMap,
  defaultMappings: SceneToColorCodesMap,
  imageCode: BitCode,
  sceneKeys: Array<SceneKey>
): ColorsForAllScenes => {

  const scenesMapped = {};
  sceneKeys.forEach(sceneKey => {
    scenesMapped[sceneKey] = getSceneColorsForImage(mappings, defaultMappings, imageCode, sceneKey)
  });

  return {
    photo: mappings[imageCode].photo,
    scenes: scenesMapped
  }
};

export const getImageMappingsWithDefaults = (
  mappings: ImageToSceneColorsMap,
  defaultMappings: SceneToColorCodesMap,
  imageCodes: Array<BitCode>,
  sceneKeys: Array<SceneKey>
): ColorsForAllImages => {

  const images = {};
  imageCodes.forEach(imageCode => {
    images[imageCode] = getVariationMappingsWithDefaults(mappings, defaultMappings, imageCode, sceneKeys)
  });
  return images;
};
