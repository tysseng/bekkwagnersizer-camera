import jsfeat from 'jsfeat';
import { findBoundingBox, findBoundingCorners } from './boundingDetection'
import { drawAllCorners, drawBoundingBox, drawCorners } from './draw';
import { timed } from '../utils/timer';
import { debug } from './config';
import logger from "../utils/logger";

const border = 5;
const blurRadius = 4;

const findCorners = (image) => {
  const corners = [];
  for (let i = 0; i < image.cols * image.rows; ++i) {
    corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0);
  }

  //yape06 works well with blurred image, not at all with the others
  const count = jsfeat.yape06.detect(image, corners, border);
  return corners.slice(0, count);
};

export const detectCornersUsingBlurredImage = (image, width, height) => {
  // remove dust! without this it corner detection will trigger on the dust particles
  const blurredImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.box_blur_gray(image, blurredImage, blurRadius);
  return findCorners(blurredImage);
};

export const detectSheetCorners = (ctx, image, width, height) => {
  const corners = timed(() => detectCornersUsingBlurredImage(image, width, height), 'detect corners');
  const boundingBox = timed(() => findBoundingBox(corners), 'find bounding box');
  const orderedCorners = timed(() => findBoundingCorners(boundingBox, corners), 'find bounding corners');
  if(debug.drawBoundingBox) timed(() => drawBoundingBox(ctx, boundingBox), 'draw bounding box');
  if(debug.drawSheetCorners) timed(() => drawCorners(ctx, orderedCorners), 'draw sheet corners');
  if(debug.drawAllCorners) timed(() => drawAllCorners(ctx, corners), 'draw All Corners');
  logger.info(orderedCorners);
  return orderedCorners;
};