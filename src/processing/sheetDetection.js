import jsfeat from 'jsfeat';
import { drawAllCorners, drawBoundingBox, drawCorners } from './draw';
import { timed } from '../utils/timer';
import config from '../config';
import logger from "../utils/logger";

const border = 5;
const blurRadius = 4;
const debug = config.debug;

const findCornerCandidatesUsingBlurredImage = (image, width, height) => {
  // removes dust! without this it corner detection will trigger on the dust particles
  const blurredImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.box_blur_gray(image, blurredImage, blurRadius);
  return findCornerCandidates(blurredImage);
};

const findCornerCandidates = (image) => {
  const corners = [];
  for (let i = 0; i < image.cols * image.rows; ++i) {
    corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0);
  }

  //yape06 works well with blurred image, not at all with the others
  const count = jsfeat.yape06.detect(image, corners, border);
  return corners.slice(0, count);
};

// finds the outermost detected points in all directions
const findBoundingBox = (corners) => {
  let minX = Number.MAX_VALUE;
  let maxX = -1;
  let minY = Number.MAX_VALUE;
  let maxY = -1;

  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i];
    if (corner.x < minX) minX = corner.x;
    if (corner.x > maxX) maxX = corner.x;
    if (corner.y < minY) minY = corner.y;
    if (corner.y > maxY) maxY = corner.y;
  }

  return {
    topLeft: { x: minX, y: minY },
    bottomRight: { x: maxX, y: maxY }
  };
};

const findSheetCorners = (boundingBox, corners) => {

  let topLeft, topRight, bottomLeft, bottomRight;

  // negation is to make sure a corner does not intersect two lines of the bounding box. if it does,
  // the corner will appear in two of the corner detections and we will either get too many or
  // too few corners.
  const topCorners = corners.filter(corner => corner.x !== boundingBox.topLeft.x && corner.y === boundingBox.topLeft.y);
  const leftCorners = corners.filter(corner => corner.x === boundingBox.topLeft.x && corner.y !== boundingBox.topLeft.y);
  const rightCorners = corners.filter(corner => corner.x === boundingBox.bottomRight.x && corner.y !== boundingBox.bottomRight.y);
  const bottomCorners = corners.filter(corner => corner.x !== boundingBox.bottomRight.x && corner.y === boundingBox.bottomRight.y);

  if(
    topCorners.length !== 1 ||
    leftCorners.length !== 1 ||
    rightCorners.length !== 1 ||
    bottomCorners.length !== 1
  ) {
    logger.error('Sheet may be too much aligned with camera, rotate slightly and try again');
    return null;
  }

  const topCorner = topCorners[0];
  const leftCorner = leftCorners[0];
  const rightCorner = rightCorners[0];
  const bottomCorner = bottomCorners[0];

  if (leftCorner.y < rightCorner.y) {
    topLeft = leftCorner;
    topRight = topCorner;
    bottomLeft = bottomCorner;
    bottomRight = rightCorner;
  } else {
    topLeft = topCorner;
    topRight = rightCorner;
    bottomLeft = leftCorner;
    bottomRight = bottomCorner;
  }

  // make sure corners are not equal

  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomLeft: bottomLeft,
    bottomRight: bottomRight,
  }
};

export const detectSheetPosition = (ctx, image, width, height) => {
  const corners = timed(() => findCornerCandidatesUsingBlurredImage(image, width, height), 'detect corners');
  const boundingBox = timed(() => findBoundingBox(corners), 'find bounding box');
  const sheetCorners = timed(() => findSheetCorners(boundingBox, corners), 'find bounding corners');
  if(sheetCorners === null){
    return null;
  }
  if(debug.drawBoundingBox) timed(() => drawBoundingBox(ctx, boundingBox), 'draw bounding box');
  if(debug.drawSheetCorners) timed(() => drawCorners(ctx, sheetCorners), 'draw sheet corners');
  if(debug.drawAllCorners) timed(() => drawAllCorners(ctx, corners), 'draw All Corners');

  return sheetCorners;
};