import jsfeat from 'jsfeat';
import { drawAllCorners, drawBoundingBox, drawCorners } from './draw';
import { timed } from '../utils/timer';
import config from '../config';
import logger from "../utils/logger";
import { distance, isApproximatelyPerpendicular } from "./trigonometry";

const border = 5;
const blurRadius = 3;
const debug = config.debug;
const drawingCircleRadiusWithPadding = (config.sourceSize.width / 2) - 5;

const drawingCircleCenter = {
  x: config.sourceSize.width / 2,
  y: config.sourceSize.height / 2,
};

const isInsideDrawingCircle = (corner) => {
  return distance(corner, drawingCircleCenter) < drawingCircleRadiusWithPadding;
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

const findCornerCandidatesUsingBlurredImage = (image) => {
  const { width, height } = config.sourceSize;
  // removes some dust! without this it corner detection will trigger on the dust particles.
  // The remaining dust will be discarded by probability check later.
  const blurredImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.box_blur_gray(image, blurredImage, blurRadius);
  return findCornerCandidates(blurredImage);
};

const isProbablySheetCorner = (corner, image, width) => {
  const {x, y} = corner;
  const padding = 15;
  const sheetColorThreshold = 180;
  const whitePixNeededForSheetCorner = 10;
  // a sheet corner should have at least one rather white field close to to it. Look around the
  // corner to see how many pixels are whiteish, about 1/4 of the pixels should be.

  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      if(image.data[row * width + col] > sheetColorThreshold) pixelCount++;
      if(pixelCount >= whitePixNeededForSheetCorner){
        return true;
      }
    }
  }
  logger.info('DUST! Ignoring corner at ' + x + ',' + y + ' - its dust to me!');
  return false;
};

const copyAndSortY = (corners) => {
  let i = corners.length;
  const cornersCopy = [];
  while (i--) cornersCopy[i] = corners[i];
  return cornersCopy.sort((corner1, corner2) => corner1.y - corner2.y);
};

const validateCorners = ({left, right, top, bottom}) => {

  // if any of the corners are on a line (or indeed the same corner), we cannot use them)
  const corners = [left, right, top, bottom];

  for(let i = 0; i<corners.length-1; i++){
    const corner1 = corners[i];
    for(let j=i+1; j<corners.length; j++){
      const corner2 = corners[j];
      if(corner1.x === corner2.x || corner1.y === corner2.y){
        logger.error('Corners failed uniqueness validation (' + i + ', ' + j + ')');
        return false;
      }
    }
  }
  return true;
};

const findValidExtremePoints = (xSorted, ySorted, image, width) => {
  const left = xSorted.find(corner => isProbablySheetCorner(corner, image, width));
  const right = xSorted.reverse().find(corner => isProbablySheetCorner(corner, image, width));
  const top = ySorted.find(corner => isProbablySheetCorner(corner, image, width));
  const bottom = ySorted.reverse().find(corner => isProbablySheetCorner(corner, image, width));

  const corners = {left, right, top, bottom};

  if(validateCorners(corners)){
    return corners
  } else {
    logger.error('Sheet may be too much aligned with camera, rotate slightly and try again');
    return null;
  }
};

const getBoundingBox = (corners) => {
  return {
    topLeft: { x: corners.left.x, y: corners.top.y },
    bottomRight: { x: corners.right.x, y: corners.bottom.y }
  };
};

const findSheetCorners = (corners) => {

  const {left, right, top, bottom} = corners;
  let topLeft, topRight, bottomLeft, bottomRight;

  if (left.y < right.y) {
    topLeft = left;
    topRight = top;
    bottomLeft = bottom;
    bottomRight = right;
  } else {
    topLeft = top;
    topRight = right;
    bottomLeft = left;
    bottomRight = bottom;
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

export const detectSheetPosition = (ctx, image, width) => {
  const corners = timed(() => findCornerCandidatesUsingBlurredImage(image), 'detect corners');

  if (debug.drawAllCorners) timed(() => drawAllCorners(ctx, corners), 'draw All Corners');

  const xSorted = corners.sort((corner1, corner2) => corner1.x - corner2.x);
  const ySorted = copyAndSortY(corners);
  const extremeCorners = findValidExtremePoints(xSorted, ySorted, image, width);

  // TODO: debug render corners;
  if(extremeCorners === null){
    return null;
  }

  // Just for debugging
  const boundingBox = getBoundingBox(extremeCorners);
  if (debug.drawBoundingBox) timed(() => drawBoundingBox(ctx, boundingBox), 'draw bounding box');

  const sheetCorners = timed(() => findSheetCorners(extremeCorners), 'find bounding corners');
  if (sheetCorners === null) {
    return null;
  }
  if (debug.drawSheetCorners) timed(() => drawCorners(ctx, sheetCorners), 'draw sheet corners');
  return sheetCorners;
};