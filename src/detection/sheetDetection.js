import jsfeat from 'jsfeat';
import {
  drawAllPoints, drawBox, drawCorners, drawImageOnCanvas,
  drawImageRotatedAroundCenter
} from '../utils/gfx/draw';
import { timed } from '../utils/timer';
import config from '../config';
import logger from "../utils/logger";
import { isApproximatelyPerpendicular, isInsideCircle } from "../utils/trigonometry";
import { copyAndSortByY, isSamePoint, sortByX } from '../utils/points';
import { mapToJsFeatImageData } from "../utils/gfx/jsfeat.utils";
import { getColorFromImageData } from "../utils/gfx/context.utils";

const border = 3;
const blurRadius = 4;

const debug = config.debug;
const drawingCircleRadiusWithPadding = (config.sourceSize.width / 2) - 5;

// fast sheet detection
const initialSamples = [];
const sheetColorDifferenceThreshold = 100;
const changedPixNeededForSheet = 10;

const drawingCircleCenter = {
  x: config.sourceSize.width / 2,
  y: config.sourceSize.height / 2,
};

const findCornerCandidates = (image) => {
  const { width, height } = config.sourceSize;

  // remove some dust and smooths surfaces. Without this it corner detection will trigger on
  // dust particles and small surface reflections etc. The remaining dust will be discarded by
  // probability check later.
  const blurredImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.box_blur_gray(image, blurredImage, blurRadius);

  const corners = [];
  for (let i = 0; i < blurredImage.cols * blurredImage.rows; ++i) {
    corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0);
  }

  //yape06 works well with blurred image, not at all with the others
  const count = jsfeat.yape06.detect(blurredImage, corners, border);

  if (config.preventDetectionOutsideBoundingCicle) {
    return corners.slice(0, count).filter(
      corner => isInsideCircle(corner, drawingCircleCenter, drawingCircleRadiusWithPadding)
    );
  } else {
    return corners.slice(0, count);
  }
};

const isProbablySheetCorner = (corner, image, width) => {
  const { x, y } = corner;
  const padding = 15;
  const sheetColorThreshold = 180;
  const whitePixNeededForSheetCorner = 10;
  // a sheet corner should have at least one rather white field close to to it. Look around the
  // corner to see how many pixels are whiteish, about 1/4 of the pixels should be.

  let pixelCount = 0;
  for (let col = x - padding; col <= x + padding; col++) {
    for (let row = y - padding; row <= y + padding; row++) {
      if (image.data[row * width + col] > sheetColorThreshold) pixelCount++;
      if (pixelCount >= whitePixNeededForSheetCorner) {
        return true;
      }
    }
  }
  logger.info('DUST! Ignoring corner at ' + x + ',' + y + ' - its dust to me!');
  return false;
};

const validateCorners = ({ left, right, top, bottom }) => {

  // if any of the corners are on a line (or indeed the same corner), we cannot use them)
  const corners = [left, right, top, bottom];

  for (let i = 0; i < corners.length - 1; i++) {
    const corner1 = corners[i];
    for (let j = i + 1; j < corners.length; j++) {
      const corner2 = corners[j];
      if (corner1.x === corner2.x || corner1.y === corner2.y) {
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

  const corners = { left, right, top, bottom };

  if(left == null || right == null || top == null || bottom == null){
    logger.error('Could not find enough corners');
    return null;
  }

  if (validateCorners(corners)) {
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

const calculateCorners = (points) => {

  const { left, right, top, bottom } = points;
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

const detectCorners = (ctx, image, width) => {
  const points = timed(() => findCornerCandidates(image), 'detect corners');

  if (debug.drawAllCorners) timed(() => drawAllPoints(ctx, points), 'draw All Corners');

  const xSorted = sortByX(points);
  const ySorted = copyAndSortByY(points);
  const extremePoints = findValidExtremePoints(xSorted, ySorted, image, width);

  // TODO: debug render corners;
  if (extremePoints === null) {
    logger.error('No extreme corners returned, aborting');
    return null;
  }

  // Just for debugging
  const boundingBox = getBoundingBox(extremePoints);
  if (debug.drawBoundingBox) timed(() => drawBox(ctx, boundingBox.topLeft, boundingBox.bottomRight), 'draw bounding box');

  const sheetCorners = timed(() => calculateCorners(extremePoints), 'find corners based on extremes and expected sheet size');
  if (sheetCorners === null) {
    return null;
  }
  if (debug.drawSheetCorners) timed(() => drawCorners(ctx, sheetCorners), 'draw sheet corners');
  return sheetCorners;
};

const drawImageOnCanvasAndDetectCorners = (imageCanvas, ctx, width, height, rotation = 0) => {
  if (rotation !== 0) {
    timed(() => drawImageRotatedAroundCenter(imageCanvas, ctx, width, height, -rotation), 'rotate');
  } else {
    drawImageOnCanvas(imageCanvas, ctx);
  }
  const grayscaledImage = mapToJsFeatImageData(ctx, width, height);
  return detectCorners(ctx, grayscaledImage, width);
};

export const findSheet = (canvases) => {
  const { width: frameWidth, height: frameHeight } = config.sourceSize;
  let sheetCorners;
  let detectedSheetCanvasContainer;
  let prerotation = 0;

  sheetCorners = drawImageOnCanvasAndDetectCorners(
    canvases.videoFrame.canvas,
    canvases.detectedSheet.ctx,
    frameWidth,
    frameHeight,
    0
  );
  detectedSheetCanvasContainer = canvases.detectedSheet;

  if (sheetCorners === null) {
    // rotate and try again. 0.10 seems like a good rotation,
    // TODO: This may not be necessary when doing centered-above photos.
    prerotation = 0.10;
    sheetCorners = drawImageOnCanvasAndDetectCorners(
      canvases.videoFrame.canvas,
      canvases.detectedSheetRotated.ctx,
      frameWidth,
      frameHeight,
      prerotation
    );
    detectedSheetCanvasContainer = canvases.detectedSheetRotated;
  }

  if (sheetCorners === null) {
    return null
  } else {
    return {
      sheetCorners,
      detectedSheetCanvasContainer,
      prerotation
    }
  }
};


// If sheet is present, some of the pixels along the center line should be non-black.
// This is a fast check before trying to find the corners.
export const isSheetPresentBW = (image, width, height) => {
  const sheetColorThreshold = 100;
  const whitePixNeededForSheet = 10;

  let pixelCount = 0;
  let row = Math.floor(height / 2);
  for (let col = 0; col < width; col++) {
    if (image.data[row * width + col] > sheetColorThreshold) pixelCount++;
    if (pixelCount >= whitePixNeededForSheet) {
      return true;
    }
  }
  logger.info(`Could not find enough white pixels (found ${pixelCount}), sheet is probably not present`);
  return false;
};

const getColorAt = (data, point, width) => {
  const color = getColorFromImageData(data, point, width);
  return color.r + color.g + color.b;
};

export const captureOriginalSheetPresenceLine = (canvases) => {
  const ctx = canvases.baselineVideoFrame.ctx;
  const { width, height } = canvases.baselineVideoFrame.dimensions;
  const data = ctx.getImageData(0, 0, width, height).data; // TODO: Possible to extract only a single row?

  let row = Math.floor(height / 2);
  for (let col = 0; col < width; col++) {
    initialSamples[col] = getColorAt(data, {x: col, y: row}, width);
  }

  console.log('original sheet presence line captured');
};

const changeIsAboveThreshold = (originalColor = 0, newColor) => {
  const diff = newColor - originalColor; // new color must be lighter than previous one
  if(diff > sheetColorDifferenceThreshold){
    return 1;
  }
  return 0;
};

// If sheet is present, some of the pixels along the center line should be non-black.
// This is a fast check before trying to find the corners.
export const isSheetPresent = (canvases) => {
  console.log(canvases);
  const ctx = canvases.videoFrame.ctx;
  const { width, height } = canvases.videoFrame.dimensions;
  const data = ctx.getImageData(0, 0, width, height).data; // TODO: Possible to extract only a single row?

  let pixelCount = 0;
  let row = Math.floor(height / 2);
  for (let col = 0; col < width; col++) {
    const originalColor = initialSamples[col];
    const newColor = getColorAt(data, {x: col, y: row}, width);

    if (changeIsAboveThreshold(originalColor, newColor)) pixelCount++;
    if (pixelCount >= changedPixNeededForSheet) {
      return true;
    }
  }
  logger.info(`Could not find enough changed pixels (found ${pixelCount}), sheet is probably not present`);
  return false;
};

export const sheetPositionHasChanged = (oldSheetParams, newSheetParams) => {
  const margin = 8;

  if (oldSheetParams === null) {
    return true;
  }

  const corners1 = oldSheetParams.sheetCorners;
  const corners2 = newSheetParams.sheetCorners;
  return !(
    isSamePoint(corners1.topLeft, corners2.topLeft, margin) &&
    isSamePoint(corners1.topRight, corners2.topRight, margin) &&
    isSamePoint(corners1.bottomLeft, corners2.bottomLeft, margin) &&
    isSamePoint(corners1.bottomRight, corners2.bottomRight, margin)
  );
};