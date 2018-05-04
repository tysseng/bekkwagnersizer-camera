import fixperspective from 'fix-perspective';
import { timed } from "../utils/timer";

export const getPerspectiveCorrectionTransform = (sheetCorners, width, height) => {
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

const copyPixel = (sourceImgData, targetImgData, from, to, width, height) => {

  // where to pick color from
  const sourcePos = (Math.floor(to.y) * width + Math.floor(to.x)) * 4;

  // where to put color
  const destPos = (from.y * width + from.x) * 4;

  targetImgData.data[destPos] = sourceImgData.data[sourcePos];
  targetImgData.data[destPos+1] = sourceImgData.data[sourcePos+1];
  targetImgData.data[destPos+2] = sourceImgData.data[sourcePos+2];
  targetImgData.data[destPos+3] = sourceImgData.data[sourcePos+3];
};

export const correctPerspective = (ctx, targetCtx, width, height, sheetCorners) => {

  const transform = timed(() => getPerspectiveCorrectionTransform(sheetCorners, width, height), 'perspective correction transform');

  let x, y;
  let i = 0;

  const imageData = ctx.getImageData(x, y, width, height);
  const targetImageData = targetCtx.getImageData(x, y, width, height);

  timed(() => {
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        const out = transform(x, y);
        copyPixel(imageData, targetImageData, { x, y }, out, width, height);
      }
    }
  }, 'pixel copying inside correct perspective');

  targetCtx.putImageData(targetImageData, 0, 0);
};
