import nearest from 'nearest-color';
import { copyCanvas } from "../utils/gfx/context.utils";
import { getImageMappingsWithDefaults } from "./colorMapping";
import { defaultMappings, mappings } from "./pushwagnerColorMaps";
import imageCodes from "./imageCodes";
import variations from "./sceneVariations";

const colorsForAllImages = getImageMappingsWithDefaults(
  mappings,
  defaultMappings,
  Object.values(imageCodes),
  Object.values(variations)
);

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

export const correctColors = (containers, imageCode) => {

  const { width, height } = containers.cropped.dimensions;
  const ctx = containers.cropped.ctx;

  copyCanvas(containers.cropped, containers.colored1);
  copyCanvas(containers.cropped, containers.colored2);
  copyCanvas(containers.cropped, containers.colored3);
  copyCanvas(containers.cropped, containers.colored4);

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

  const manhattanColors = colorsForImage.variations[variations.manhattan];

  console.log(manhattanColors);

  // replace with screen colors
  //writeColorReplaced(sourceData, dataLength, intermediate, containers.uploadable1, colorMaps[0]);
  writeColorReplaced(sourceData, dataLength, intermediate, containers.colored1, manhattanColors);
 // writeColorReplaced(sourceData, dataLength, intermediate, containers.uploadable2, colorMaps[1]);
 // writeColorReplaced(sourceData, dataLength, intermediate, containers.uploadable3, colorMaps[2]);
 // writeColorReplaced(sourceData, dataLength, intermediate, containers.uploadable4, colorMaps[3]);
};