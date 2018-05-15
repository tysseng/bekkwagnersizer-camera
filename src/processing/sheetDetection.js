import jsfeat from 'jsfeat';
import { drawAllCorners, drawBoundingBox, drawCorners } from './draw';
import { timed } from '../utils/timer';
import config from '../config';
import logger from "../utils/logger";
import { distance, isApproximatelyPerpendicular } from "./trigonometry";

const border = 5;
const blurRadius = 4;
const debug = config.debug;
const drawingCircleRadiusWithPadding = (config.sourceSize.width / 2) - 5;

const drawingCircleCenter = {
  x: config.sourceSize.width / 2,
  y: config.sourceSize.height / 2,
};

const isInsideDrawingCircle = (corner) => {
  return distance(corner, drawingCircleCenter) < drawingCircleRadiusWithPadding;
};

const findCornerCandidatesUsingBlurredImage = (image) => {
  const { width, height } = config.sourceSize;
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


  if (config.preventDetectionOutsideBoundingCicle) {
    return corners.slice(0, count).filter(corner => isInsideDrawingCircle(corner));
  } else {
    return corners.slice(0, count);
  }
};
/*
const isProbablySheetCorner = (corner, image) => {
  const padding = 15;
  const sheetColorThreshold = 180;
  const whitePixNeededForSheetCorner = 10;
  // a sheet corner should have at least one rather white field close to to it. Look around the
  // corner to see how many pixels are whiteish, about 1/4 of the pixels should be.

  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      if(image.data[row * imageWidth + col] > sheetColorThreshold) pixelCount++;
      if(pixelCount >= whitePixNeededForSheetCorner){
        return true;
      }
    }
  }
  return false;
};
*/
const copyAndSortY = (corners) => {
  let i = corners.length;
  const cornersCopy = [];
  while (i--) cornersCopy[i] = corners[i];
  return cornersCopy.sort((corner1, corner2) => corner1.y - corner2.y);
};
/*
const findCorners = (xSorted, ySorted, image) => {
  const leftMost = xSorted.find(corner => isProbablySheetCorner(corner, image));
  const rightMost = xSorted.reverse().find(corner => isProbablySheetCorner(corner, image));
  const topMost = ySorted.find(corner => isProbablySheetCorner(corner, image));
  const bottomMost = ySorted.reverse().find(corner => isProbablySheetCorner(corner, image));

  console.log('corners', {leftMost, rightMost, topMost, bottomMost});
};
*/

// finds the outermost detected points in all directions
const findBoundingBox = (xSorted, ySorted) => {
  return {
    topLeft: { x: xSorted[0].x, y: ySorted[0].y },
    bottomRight: { x: xSorted[xSorted.length - 1].x, y: ySorted[ySorted.length - 1].y }
  };
};

const findSheetCorners = (boundingBox, corners) => {

  let topLeft, topRight, bottomLeft, bottomRight;

  // negation is to make sure a corner does not intersect two lines of the bounding box. if it does,
  // the corner will appear in two of the corner detections and we will either get too many or
  // too few corners.
  const topCorners = corners.filter(
    corner => corner.x !== boundingBox.topLeft.x && corner.y === boundingBox.topLeft.y);
  const leftCorners = corners.filter(
    corner => corner.x === boundingBox.topLeft.x && corner.y !== boundingBox.topLeft.y);
  const rightCorners = corners.filter(
    corner => corner.x === boundingBox.bottomRight.x && corner.y !== boundingBox.bottomRight.y);
  const bottomCorners = corners.filter(
    corner => corner.x !== boundingBox.bottomRight.x && corner.y === boundingBox.bottomRight.y);

  if (
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

  // make sure we have found the sheet
  if (
    !isApproximatelyPerpendicular(topLeft, bottomLeft, topRight) || // angle of upper left corner
    !isApproximatelyPerpendicular(bottomRight, topRight, bottomLeft) // angle of lower right corner
  ) {
    logger.error('Corners are not perpendicular, this is not the sheet we\'re looking for');
    return null;
  }

  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomLeft: bottomLeft,
    bottomRight: bottomRight,
  }
};

export const detectSheetPosition = (ctx, image) => {
  const corners = timed(() => findCornerCandidatesUsingBlurredImage(image), 'detect corners');

  if (debug.drawAllCorners) timed(() => drawAllCorners(ctx, corners), 'draw All Corners');

  const xSorted = corners.sort((corner1, corner2) => corner1.x - corner2.x);
  const ySorted = copyAndSortY(corners);
  //findCorners(xSorted, ySorted, image);

  const boundingBox = timed(() => findBoundingBox(xSorted, ySorted), 'find bounding box');
  if (debug.drawBoundingBox) timed(() => drawBoundingBox(ctx, boundingBox), 'draw bounding box');

  const sheetCorners = timed(() => findSheetCorners(boundingBox, corners), 'find bounding corners');
  if (sheetCorners === null) {
    return null;
  }
  if (debug.drawSheetCorners) timed(() => drawCorners(ctx, sheetCorners), 'draw sheet corners');
  return sheetCorners;
};