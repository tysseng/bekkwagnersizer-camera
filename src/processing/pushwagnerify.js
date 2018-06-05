import nearest from 'nearest-color';
import { copyCanvas } from "../utils/gfx/context.utils";
import { getImageMappingsWithDefaults } from "./colorMapping";
import { getDefaultMappings, getMappings } from "./pushwagnerColorMaps";
import { imageCodes } from "./imageCodes";
import variations from "./sceneVariations";
import logger from "../utils/logger";
import { getNextColoredContainer } from "../canvases";

let colorsForAllImages;

// Must be run after color calibration
export const updateColorsForAllImages = () => {
  colorsForAllImages = getImageMappingsWithDefaults(
    getMappings(),
    getDefaultMappings(),
    Object.values(imageCodes),
    Object.values(variations)
  );
  console.log('UPDATED COLORS FOR ALL IMAGES', colorsForAllImages);
};

const writeColorReplaced = (sourceData, dataLength, intermediate, target, colorMap) => {
  const { width, height } = target.dimensions;
  const targetCtx = target.ctx;
  const imageData = targetCtx.getImageData(0, 0, width, height);
  const targetData = imageData.data;

  for (let i = 0; i < dataLength; i += 4) {
    if (sourceData[i + 3] > 0) {
      const newOutputColor = colorMap[intermediate[i / 4]];
      targetData[i] = newOutputColor.r;
      targetData[i + 1] = newOutputColor.g;
      targetData[i + 2] = newOutputColor.b;
    }
  }
  targetCtx.putImageData(imageData, 0, 0);
};

export const correctColors = (sourceContainer, imageCode) => {
  try {

    const { width, height } = sourceContainer.dimensions;
    const ctx = sourceContainer.ctx;

    const coloredContainers = [
      getNextColoredContainer(sourceContainer.dimensions, 'People'),
      getNextColoredContainer(sourceContainer.dimensions, 'Manhattan'),
      getNextColoredContainer(sourceContainer.dimensions, 'Kings Cross 1'),
      getNextColoredContainer(sourceContainer.dimensions, 'Kings Cross 2')
    ];
    coloredContainers.forEach(coloredContainer => {
      copyCanvas(sourceContainer, coloredContainer);
    });

    const imageData = ctx.getImageData(0, 0, width, height);
    const sourceData = imageData.data;
    const dataLength = height * width * 4;

    const intermediate = [];

    const colorsForImage = colorsForAllImages[imageCode];

    const nearestPhotoColor = nearest.from(colorsForImage.photo);

    // detect closest photo colors
    for (let i = 0; i < dataLength; i += 4) {
      if (sourceData[i + 3] > 0) {
        const oldColor = { r: sourceData[i], g: sourceData[i + 1], b: sourceData[i + 2] };
        const newPhotoColor = nearestPhotoColor(oldColor);
        intermediate[i / 4] = newPhotoColor.value;
      }
    }

    const peopleColors = colorsForImage.variations[variations.people];
    const manhattanColors = colorsForImage.variations[variations.manhattan];
    const kingscross1Colors = colorsForImage.variations[variations.kingscross1];
    const kingscross2Colors = colorsForImage.variations[variations.kingscross2];

    // replace with screen colors
    writeColorReplaced(sourceData, dataLength, intermediate, coloredContainers[0], peopleColors);
    writeColorReplaced(sourceData, dataLength, intermediate, coloredContainers[1], manhattanColors);
    writeColorReplaced(sourceData, dataLength, intermediate, coloredContainers[2], kingscross1Colors);
    writeColorReplaced(sourceData, dataLength, intermediate, coloredContainers[3], kingscross2Colors);

    return coloredContainers;

  } catch (err) {
    logger.error(err);
  }
};