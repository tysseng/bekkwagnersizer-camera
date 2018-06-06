// @flow
import jsfeat from 'jsfeat';
import {
  drawAllPoints, drawBox, drawCorners, drawImageOnContext,
  drawImageRotatedAroundCenter
} from '../utils/gfx/draw';
import { timed } from '../utils/timer';
import config from '../config';
import logger from "../utils/logger";
import { isApproximatelyPerpendicular, isInsideCircle } from "../utils/trigonometry";
import { copyAndSortByY, isSamePoint, sortByX } from '../utils/points';
import { mapToJsFeatImageData } from "../utils/gfx/jsfeat.utils";
import { getNextProcessingContainer } from "../canvases";
import type { Container, JsfeatImage, Point, SheetParams } from "../types";

type SheetExtremes = {
  left: Point,
  right: Point,
  top: Point,
  bottom: Point,
}

type BoundingCorners = {
  topLeft: Point,
  bottomRight: Point
}

// for video
/*
const border = 3;
const blurRadius = 4;
*/

// for image
const border = 4;
const blurRadius = 3;

const debug = config.debug;
const drawingCircleRadiusWithPadding = (config.sourceSize.width / 2) - 5;

const drawingCircleCenter = {
  x: config.sourceSize.width / 2,
  y: config.sourceSize.height / 2,
};

const findCornerCandidates = (image: JsfeatImage): Array<Point> => { // TODO jsfeat.keypoint_t
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

const isProbablySheetCorner = (corner: Point, image: JsfeatImage, width: number): boolean => {
  const { x, y } = corner;
  const padding = 15;
  //const sheetColorThreshold = 180;
  const sheetColorThreshold = 120;
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


const validateCorners = ({ left, right, top, bottom }: SheetExtremes): boolean => {

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

const findValidExtremePoints = (
  xSorted: Array<Point>,
  ySorted: Array<Point>,
  image: JsfeatImage,
  width: number) => {
  const left = xSorted.find(corner => isProbablySheetCorner(corner, image, width));
  const right = xSorted.reverse().find(corner => isProbablySheetCorner(corner, image, width));
  const top = ySorted.find(corner => isProbablySheetCorner(corner, image, width));
  const bottom = ySorted.reverse().find(corner => isProbablySheetCorner(corner, image, width));

  if (left == null || right == null || top == null || bottom == null) {
    logger.error('Could not find enough corners');
    return null;
  }

  const corners =({ left, right, top, bottom });
  if (validateCorners(corners)) {
    return corners
  } else {
    logger.error('Sheet may be too much aligned with camera, rotate slightly and try again');
    return null;
  }
};

const getBoundingBox = (corners: SheetExtremes): BoundingCorners => {
  return {
    topLeft: { x: corners.left.x, y: corners.top.y },
    bottomRight: { x: corners.right.x, y: corners.bottom.y }
  };
};

const calculateCorners = (points: SheetExtremes) => {

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

const detectCorners = (ctx: CanvasRenderingContext2D, image: JsfeatImage, width: number) => {
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

const drawImageOnCanvasAndDetectCorners = (sourceContainer: Container, targetContainer: Container, rotation: number = 0) => {

  if (rotation !== 0) {
    timed(() => drawImageRotatedAroundCenter(sourceContainer, targetContainer, -rotation), 'rotate');
  } else {
    drawImageOnContext(sourceContainer, targetContainer);
  }

  const targetCtx = targetContainer.ctx;
  const grayscaledImage = mapToJsFeatImageData(targetContainer);
  const { width, } = targetContainer.dimensions;
  return detectCorners(targetCtx, grayscaledImage, width);
};

export const findSheet = (videoFrameContainer: Container): ?SheetParams => {
  let sheetCorners;
  let prerotation = 0;

  sheetCorners = drawImageOnCanvasAndDetectCorners(
    videoFrameContainer,
    getNextProcessingContainer(videoFrameContainer.dimensions, 'Detected sheet'),
    0
  );

  if (sheetCorners === null) {
    // rotate and try again. 0.10 seems like a good rotation,
    // TODO: This may not be necessary when doing centered-above photos.
    prerotation = 0.10;
    sheetCorners = drawImageOnCanvasAndDetectCorners(
      videoFrameContainer,
      getNextProcessingContainer(videoFrameContainer.dimensions, 'Detected sheet second try (rotated)'),
      prerotation
    );
  }

  if (sheetCorners === null) {
    return null
  } else {
    return {
      sheetCorners,
      prerotation
    }
  }
};

export const sheetPositionHasChanged = (
  oldSheetParams: SheetParams,
  newSheetParams: SheetParams
) => {
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