// @flow
import fixperspective from 'fix-perspective';
import { timed } from "../utils/timer";
import { getNextProcessingContainer } from "../canvases";
import type { Container, Point, SheetCorners } from "../types";
import config from "../config";

export const getPerspectiveCorrectionTransform = (
  sheetCorners: SheetCorners, width: number, height: number
) => {
  const from = [
    sheetCorners.topLeft,
    sheetCorners.topRight,
    sheetCorners.bottomRight,
    sheetCorners.bottomLeft,
  ];
  const to = [
    {x: 0, y: 0},
    {x: width-1, y: 0},
    {x: width-1, y: height-1},
    {x: 0, y: height-1},
  ];

  // NB: to and from has been swapped on purpose. The idea is, we need to know the source point
  // for every pixel in the target image and do this by querying for the position in the original
  // image for each pixel in the target.
  return fixperspective(to, from);
};

const copyPixel = (
  source: ImageData, target: ImageData, from: Point, to: Point, width: number
) => {

  // where to pick color from
  const sourcePos = (Math.floor(to.y) * width + Math.floor(to.x)) * 4;

  // where to put color
  const destPos = (from.y * width + from.x) * 4;

  target.data[destPos] = source.data[sourcePos];
  target.data[destPos+1] = source.data[sourcePos+1];
  target.data[destPos+2] = source.data[sourcePos+2];
  target.data[destPos+3] = source.data[sourcePos+3];
};

export const correctPerspective = (source: Container, sheetCorners: SheetCorners): Container => {

  const sourceCtx = source.ctx;
  const {height, width} = source.dimensions;

  const corrected = getNextProcessingContainer(config.sheetSize, 'Perspective corrected');
  const {width: correctedWidth, height: correctedHeight } = corrected.dimensions;
  const correctedCtx = corrected.ctx;

  const transform = timed(() => getPerspectiveCorrectionTransform(
    sheetCorners, correctedWidth, correctedHeight
  ), 'perspective correction transform');

  const imageData = sourceCtx.getImageData(0, 0, width, height);
  const correctedImageData = correctedCtx.getImageData(0, 0, correctedWidth, correctedHeight);

  timed(() => {
    for (let y = 0; y < correctedHeight; y++) {
      for (let x = 0; x < correctedWidth; x++) {
        const out = transform(x, y);
        copyPixel(imageData, correctedImageData, { x, y }, out, width);
      }
    }
  }, 'pixel copying inside correct perspective');

  correctedCtx.putImageData(correctedImageData, 0, 0);
  return corrected;
};
