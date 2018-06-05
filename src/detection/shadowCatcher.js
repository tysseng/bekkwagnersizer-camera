// lets us even out shadows by capturing a white sheet and setting a per-pixel white balance.
import { timed } from "../utils/timer";

export const getCorrectedColorComponent = (colorComponent, whiteComponent) => {
  const whiteDiff = 255 - whiteComponent;
  const correctedComponent = colorComponent + whiteDiff;
  if (correctedComponent > 255) {
    return 255
  }
  return 0;
};

export const removeShadows = (sourceContainer, whiteContainer, canvases) => {

  const {width, height} = sourceContainer;
  const sourceCtx = sourceContainer.ctx;
  const correctedImageData = sourceCtx.getImageData(0, 0, width, height);
  const correctedData = correctedImageData.data;
  const whiteData = whiteContainer.ctx.getImageData(0, 0, width, height).data;

  // TODO: Only remove pixels inside circle to speed up process.
  timed(() => {
    for (let i = 0; i < width * height * 4; i++) {
      correctedData[i] = getCorrectedColorComponent(correctedData[i], whiteData[i]);
      correctedData[i + 1] = getCorrectedColorComponent(correctedData[i], whiteData[i + 2]);
      correctedData[i + 2] = getCorrectedColorComponent(correctedData[i], whiteData[i + 2]);
      i += 4;
    }
  }, 'Removing whitepoint from all pixels');

  const targetContainer = canvases.whiteCorrectedVideoFrame;
  const targetCtx = targetContainer.ctx;
  targetCtx.putImageData(correctedData, 0, 0);
  return targetContainer;
};