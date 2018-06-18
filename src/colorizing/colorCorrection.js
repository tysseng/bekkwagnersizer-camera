// @flow
import nearest from 'nearest-color';
import { copyCanvas } from "../utils/gfx/context.utils";
import { getNextColoredContainer } from "../canvases";
import {
  getColorsForAllImages, getPhotoColorCodesFromKeys,
} from "./colorRepository";
import config from "../config";
import type {
  BitCode, ColorsForAllScenes, Container, PhotoColorKey, SceneColorCodes,
  SceneKey
} from "../types";

const writeColorReplaced = (
  sourceData: Uint8ClampedArray,
  dataLength: number,
  intermediate: Array<PhotoColorKey>,
  target: Container,
  colorMap: SceneColorCodes
) => {
  const { width, height } = target.size;
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
  key: SceneKey,
  colorsForImage: ColorsForAllScenes,
  sourceContainer: Container,
  sourceData: Uint8ClampedArray,
  dataLength: number,
  intermediate: Array<PhotoColorKey>
) => {
  const coloredContainer = getNextColoredContainer(sourceContainer.size, 'Replaced colors for ' + key);
  copyCanvas(sourceContainer, coloredContainer);
  const colors = colorsForImage.scenes[key];
  writeColorReplaced(sourceData, dataLength, intermediate, coloredContainer, colors);
  return coloredContainer;
};

export const correctColors = (source: Container, imageCode: BitCode): { [SceneKey]: Container } => {
  const { width, height } = source.size;
  const ctx = source.ctx;
  const imageData = ctx.getImageData(0, 0, width, height);
  const sourceData = imageData.data;
  const dataLength = height * width * 4;

  const intermediate: Array<PhotoColorKey> = [];

  const colorsForImage = getColorsForAllImages()[imageCode];
  const photoColorCodesToSearchFor = getPhotoColorCodesFromKeys(colorsForImage.photo);

  const nearestPhotoColor = nearest.from(photoColorCodesToSearchFor);

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
    coloredContainers[sceneKey] = replaceColors(
      sceneKey, colorsForImage, source, sourceData, dataLength, intermediate
    );
  });

  return coloredContainers;
};