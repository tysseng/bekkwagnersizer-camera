// @flow
import type { Point } from "../types";

export const sortByX = (points: Array<Point>) => {
  points.sort(
    (point1, point2) => point1.x - point2.x
  );
};

export const copyAndSortByY = (points: Array<Point>): Array<Point> => {
  let i = points.length;
  const pointsCopy = [];
  while (i--) pointsCopy[i] = points[i];
  return pointsCopy.sort((point1, point2) => point1.y - point2.y);
};

export const isSamePoint = (point1: Point, point2: Point, margin: number) => {
  return Math.abs(point1.x - point2.x) < margin &&
    Math.abs(point1.y - point2.y) < margin;
};
