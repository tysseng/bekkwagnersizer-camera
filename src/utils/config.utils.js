// @flow
const getPPMM = (pixels, width) => pixels / width;

const getInPixels = (mm: number, pixelsPerMM: number): number => Math.floor(mm * pixelsPerMM);

const getArrayInPixels = (mmArray: Array<number>, pixelsPerMM: number): Array<number> =>
  mmArray.map(mm => getInPixels(mm, pixelsPerMM));

const getPointInPixels = ({x, y}: Point, pixelsPerMM: number): Point => ({
  x: getInPixels(x, pixelsPerMM),
  y: getInPixels(y, pixelsPerMM),
});