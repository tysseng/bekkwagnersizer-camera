import { floodFill } from "../utils/gfx/draw";
import { copyCanvas, copyCanvasCentered } from "../utils/gfx/context.utils";
import { timed } from "../utils/timer";
import { getNextProcessingContainer } from "../canvases";

export const floodFillWithPadding = (source, canvases) => {

  // TODO: draw sheet colored square on target before copying
  // TODO: thinner border

  const {width, height} = canvases.filledExpanded.dimensions;
  const sourceCtx = canvases.filledExpanded.ctx;

  sourceCtx.fillStyle="#000000";
  sourceCtx.fillRect(0,0,width, height);

  // expand canvas to get a continous border around the image, to be able to properly flood fill.
  copyCanvasCentered(source, canvases.filledExpanded);

  // flood fill outside (e.g. the part that will be our mask)
  timed(() => floodFill(sourceCtx, 2, 255, 0, 0, 0.5), 'flood fill mask');

  // remove expansion
  const filledContractedContainer = getNextProcessingContainer(config.sheetSize);
  copyCanvasCentered(canvases.filledExpanded, filledContractedContainer);
  return filledContractedContainer;
};

export const floodFillWithoutPadding = (source, canvases) => {
  const filledContractedContainer = getNextProcessingContainer(config.sheetSize);
  copyCanvas(source, filledContractedContainer);

  // flood fill outside (e.g. the part that will be our mask)
  //TODO: What does padding really mean, isn't it the origin for the flood fill????
  timed(() => floodFill(filledContractedContainer.ctx, 20, 255, 0, 0, 0.5), 'flood fill mask');
  return filledContractedContainer;
};
