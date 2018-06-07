// @flow
import { floodFill } from "../utils/gfx/draw";
import { copyCanvasCentered } from "../utils/gfx/context.utils";
import { timed } from "../utils/timer";
import { getNextProcessingContainer } from "../canvases";
import config from "../config";
import type { Container } from "../types";

export const floodFillWithPadding = (source: Container): Container => {

  // TODO: draw sheet colored square on target before copying
  // TODO: thinner border

  const filledExpandedContainer = getNextProcessingContainer(config.filledExpandedSize, 'Flood fill expanded');

  const {width, height} = config.filledExpandedSize;
  const sourceCtx = filledExpandedContainer.ctx;

  sourceCtx.fillStyle="#000000";
  sourceCtx.fillRect(0,0,width, height);

  // expand canvas to get a continous border around the image, to be able to properly flood fill.
  copyCanvasCentered(source, filledExpandedContainer);

  // flood fill outside (e.g. the part that will be our mask)
  timed(() => floodFill(sourceCtx, 2, 255, 0, 0, 0.5), 'flood fill mask');

  // remove expansion
  const filledContractedContainer = getNextProcessingContainer(config.sheetSize, 'Flood fill contracted');
  copyCanvasCentered(filledExpandedContainer, filledContractedContainer);
  return filledContractedContainer;
};