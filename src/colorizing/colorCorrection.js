import nearest from 'nearest-color';
import { copyCanvas } from "../utils/gfx/context.utils";
import logger from "../utils/logger";
import { getNextColoredContainer } from "../canvases";
import {
  getColorsForAllImages, getPhotoColorCodesFromKeys,
} from "./colorRepository";
import config from "../config";

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

const replaceColors = (
  { key, colorsForImage, sourceContainer, sourceData, dataLength, intermediate }
) => {
  const coloredContainer = getNextColoredContainer(sourceContainer.dimensions);
  copyCanvas(sourceContainer, coloredContainer);
  const colors = colorsForImage.sceneConfigs[key];
  writeColorReplaced(sourceData, dataLength, intermediate, coloredContainer, colors);
  return coloredContainer;
};

export const correctColors = (sourceContainer, imageCode) => {
  try {

    const { width, height } = sourceContainer.dimensions;
    const ctx = sourceContainer.ctx;
    const imageData = ctx.getImageData(0, 0, width, height);
    const sourceData = imageData.data;
    const dataLength = height * width * 4;

    const intermediate = [];

    const colorsForImage = getColorsForAllImages()[imageCode];

    const photoColorCodes = getPhotoColorCodesFromKeys(colorsForImage.photo);
    const nearestPhotoColor = nearest.from(photoColorCodes);

    // detect closest photo colors
    for (let i = 0; i < dataLength; i += 4) {
      if (sourceData[i + 3] > 0) {
        const oldColor = { r: sourceData[i], g: sourceData[i + 1], b: sourceData[i + 2] };
        const newPhotoColor = nearestPhotoColor(oldColor);

        // using name instead of value as this lets us change the color codes for the color in the
        // photo without changing the mapping from photo color to variation color.
        intermediate[i / 4] = newPhotoColor.name;
      }
    }

    // replace colors for all scenes
    const coloredContainers = {};
    const scenes = config.sceneConfig.scenes;
    Object.keys(scenes).forEach(sceneKey => {
      coloredContainers[sceneKey] = replaceColors({
        key: sceneKey, colorsForImage, sourceContainer, sourceData, dataLength, intermediate
      });
    });

    return coloredContainers;
  } catch (err) {
    logger.error(err);
  }
};