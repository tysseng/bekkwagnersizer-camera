// @flow
import type { Dimensions, Point } from "../types";

export const getPPMM = (pixels: number, width: number): number => pixels / width;

export const getInPixels = (mm: number, pixelsPerMM: number): number => Math.floor(mm * pixelsPerMM);

export const getArrayInPixels = (mmArray: Array<number>, pixelsPerMM: number): Array<number> =>
  mmArray.map(mm => getInPixels(mm, pixelsPerMM));

export const getPointInPixels = ({x, y}: Point, pixelsPerMM: number): Point => ({
  x: getInPixels(x, pixelsPerMM),
  y: getInPixels(y, pixelsPerMM),
});

export const getSizeInPixels = ({width, height}: Dimensions, pixelsPerMM: number): Dimensions => ({
  width: getInPixels(width, pixelsPerMM),
  height: getInPixels(height, pixelsPerMM),
});