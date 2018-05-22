import { floodFill } from "../utils/gfx/draw";
import { copyCanvas, copyCanvasCentered } from "../utils/gfx/context.utils";
import { timed } from "../utils/timer";

export const floodFillWithPadding = (source, canvases) => {

  // TODO: draw sheet colored square on target before copying
  // TODO: thinner border
  const {width, height} = canvases.filledExpanded.dimensions;
  canvases.filledExpanded.ctx.fillRect(0,0,width, height);

  // expand canvas to get a continous border around the image, to be able to properly flood fill.
  copyCanvasCentered(source, canvases.filledExpanded);

  // flood fill outside (e.g. the part that will be our mask)
  timed(() => floodFill(canvases.filledExpanded.ctx, 2, 255, 0, 0, 0.5), 'flood fill mask');

  // remove expansion
  copyCanvasCentered(canvases.filledExpanded, canvases.filledContracted);
};

export const floodFillWithoutPadding = (source, canvases) => {
  copyCanvas(source, canvases.filledContracted);

  // flood fill outside (e.g. the part that will be our mask)
  //TODO: What does padding really mean, isn't it the origin for the flood fill????
  timed(() => floodFill(canvases.filledContracted.ctx, 20, 255, 0, 0, 0.5), 'flood fill mask');
};
