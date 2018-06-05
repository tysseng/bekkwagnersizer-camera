import { floodFill } from "../utils/gfx/draw";
import { copyCanvas, copyCanvasCentered } from "../utils/gfx/context.utils";
import { timed } from "../utils/timer";
import { getNextProcessingContainer } from "../canvases";
import config from "../config";

export const floodFillWithPadding = (source) => {

  // TODO: draw sheet colored square on target before copying
  // TODO: thinner border

  const filledExpandedContainer = getNextProcessingContainer(config.filledExpandedSize);

  const {width, height} = config.filledExpandedSize;
  const sourceCtx = filledExpandedContainer.filledExpanded.ctx;

  sourceCtx.fillStyle="#000000";
  sourceCtx.fillRect(0,0,width, height);

  // expand canvas to get a continous border around the image, to be able to properly flood fill.
  copyCanvasCentered(source, filledExpandedContainer);

  // flood fill outside (e.g. the part that will be our mask)
  timed(() => floodFill(sourceCtx, 2, 255, 0, 0, 0.5), 'flood fill mask');

  // remove expansion
  const filledContractedContainer = getNextProcessingContainer(config.sheetSize);
  copyCanvasCentered(filledExpandedContainer, filledContractedContainer);
  return filledContractedContainer;
};

export const floodFillWithoutPadding = (source) => {
  const filledContractedContainer = getNextProcessingContainer(config.sheetSize);
  copyCanvas(source, filledContractedContainer);

  // flood fill outside (e.g. the part that will be our mask)
  //TODO: What does padding really mean, isn't it the origin for the flood fill????
  timed(() => floodFill(filledContractedContainer.ctx, 20, 255, 0, 0, 0.5), 'flood fill mask');
  return filledContractedContainer;
};
