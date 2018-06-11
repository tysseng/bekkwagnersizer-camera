// @flow
import logger from "./logger";
import type { Point } from "../types";

export const distance = (point1: Point, point2: Point) => {
  const x = point2.x - point1.x;
  const y = point2.y - point1.y;
  return Math.sqrt(x * x + y * y);
};

// Check if the three points make up two lines at a 90 degrees angle with centerPoint as the
// common connecting point
const offsetDegrees = 4;
const offsetRadians = ( 2 * Math.PI * offsetDegrees) / 360;
const targetAngle = Math.PI / 2;
const lowerBound = targetAngle - offsetRadians;
const upperBound = targetAngle + offsetRadians;

export const isApproximatelyPerpendicular = (
  centerPoint: Point, point2: Point, point3: Point
): boolean => {

  // https://stackoverflow.com/questions/1211212/how-to-calculate-an-angle-from-three-points?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  const distCenter_2 = distance(centerPoint, point2);
  const distCenter_3 = distance(centerPoint, point3);
  const dist2_3 = distance(point2, point3);

  const sqrDist2 = distCenter_2 * distCenter_2;
  const sqrDist3 = distCenter_3 * distCenter_3;
  const sqrDist2_3 = dist2_3 * dist2_3;

  const angle = Math.acos((sqrDist2 + sqrDist3 - sqrDist2_3) / ( 2  * distCenter_2 * distCenter_3));
  logger.info('Corner angle is ' + (360 *  angle / (2*Math.PI)));

  return angle >= lowerBound && angle <= upperBound;
};

export const getPointFromAngle = (angle: number, center: Point, radius: number): Point => {
  return {
    x: Math.floor(center.x + radius * Math.cos(angle)),
    y: Math.floor(center.y + radius * Math.sin(angle))
  }
};

export const rotatePointAroundCenter = (
  point: Point, width: number, height: number, angle: number
) => {
  const centerX = point.x - (width / 2);
  const centerY = point.y - (height / 2);

  const newX = (centerX * Math.cos(angle)) - (centerY * Math.sin(angle));
  const newY = (centerY * Math.cos(angle)) + (centerX * Math.sin(angle));

  return { x: Math.round(newX + (width / 2)), y: Math.round(newY + (height / 2)) };
};

export const isInsideCircle = (point: Point, center: Point, radius: number) => {
  return distance(point, center) < radius;
};
