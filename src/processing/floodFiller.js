// @flow
import { floodFill } from "../utils/gfx/draw";
import { copyCanvasCentered } from "../utils/gfx/canvas.utils";
import { timed } from "../utils/timer";
import { getNextProcessingContainer } from "../canvases";
import config from "../config";
import type { Container, RgbaColor } from "../types";

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
  const fillStartingPoint = {x: 2, y: 2};
  const fillColor: RgbaColor = {r: 255, g: 0, b: 0, a: 0.5};
  timed(() => floodFill(sourceCtx, fillStartingPoint, fillColor), 'flood fill mask');

  // remove expansion
  const filledContractedContainer = getNextProcessingContainer(config.sheetSize, 'Flood fill contracted');
  copyCanvasCentered(filledExpandedContainer, filledContractedContainer);
  return filledContractedContainer;
};