import config from "../config";
import { timed } from "../utils/timer";

const padding = 2;

export const resizeToUploadSize = (extractedContainer, uploadableContainer) => {

  const extractedCanvas = extractedContainer.canvas;
  const uploadableCtx = uploadableContainer.ctx;
  const { height, width } = uploadableContainer.dimensions;

  const unpaddedWidth = width - 2 * padding;
  const unpaddedHeight = height - 2 * padding;
  const targetHeight = config.uploadSize.height;
  const scale = targetHeight / unpaddedHeight;
  const targetWidth = unpaddedWidth * scale;

  const targetXOffset = Math.floor((config.uploadSize.width - targetWidth) / 2);

  timed(() => uploadableCtx.drawImage(
    extractedCanvas,
    0 + padding, 0 + padding, unpaddedWidth, unpaddedHeight, // from
    targetXOffset, 0, targetWidth, targetHeight, // to
  ), 'Copying to upload canvas');
};