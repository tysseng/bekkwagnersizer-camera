export const color = (hexString, a = 255) => {
  return {
    r: parseInt(hexString.substring(1, 3), 16),
    g: parseInt(hexString.substring(3, 5), 16),
    b: parseInt(hexString.substring(5, 7), 16),
    a,
  }
};

// get color mapping for a specific variation
const getScreenColors = (photoColors, variationColors, defaultVariationColors) => {
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

const getMappingWithDefaults = (mappings, defaultMappings, imageCode, variation) => {
  const photoColors = mappings[imageCode].photo;

  const variationColors = mappings[imageCode][variation];
  const defaultVariationColors = defaultMappings[variation];
  return getScreenColors(photoColors, variationColors, defaultVariationColors);
};

const getVariationMappingsWithDefaults = (mappings, defaultMappings, imageCode, variations) => {

  const variationsMapped = {};
  variations.forEach(variationId => {
    variationsMapped[variationId] = getMappingWithDefaults(mappings, defaultMappings, imageCode, variationId)
  });

  const photoColors = {};
  mappings[imageCode].photo.forEach(photoColor => {
    photoColors[photoColor] = photoColor;
  });
  return {
    photo: photoColors,
    variations: variationsMapped
  }
};

export const getImageMappingsWithDefaults = (mappings, defaultMappings, imageCodes, variations) => {

  const images = {};
  imageCodes.forEach(imageCode => {
    images[imageCode] = getVariationMappingsWithDefaults(mappings, defaultMappings, imageCode, variations)
  });
  return images;
};
