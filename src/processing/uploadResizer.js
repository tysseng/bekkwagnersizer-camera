// @flow
import config from "../config";
import { timed } from "../utils/timer";
import { getNextUploadableContainer } from "../canvases";
import type { Container } from "../types";

const padding = 2;

export const resizeToUploadSize = (source: Container) => {

  const target = getNextUploadableContainer(config.uploadSize, 'Uploadable');
  const targetCtx = target.ctx;

  const sourceCanvas = source.canvas;
  const { height: sourceHeight, width: sourceWidth } = source.dimensions;

  const unpaddedWidth = sourceWidth - 2 * padding;
  const unpaddedHeight = sourceHeight - 2 * padding;

  const targetHeight = config.uploadSize.height;
  const scale = targetHeight / unpaddedHeight;
  const targetWidth = unpaddedWidth * scale;

  const targetXOffset = Math.floor((config.uploadSize.width - targetWidth) / 2);

  timed(() => targetCtx.drawImage(
    sourceCanvas,
    padding, padding, unpaddedWidth, unpaddedHeight, // from
    targetXOffset, 0, targetWidth, targetHeight, // to
  ), 'Copying to upload canvas');
  return target;
};