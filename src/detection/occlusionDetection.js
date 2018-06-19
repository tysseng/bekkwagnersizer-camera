// @flow
// try to figure out when something (like a hand) enters the circle
import config from "../config";
import { getPointFromAngle } from "../utils/trigonometry";
import { getPointColorFromImageData } from "../utils/gfx/canvas.utils";
import { drawPoint } from "../utils/gfx/draw";
import logger from "../utils/logger";
import { abortable } from "../utils/promises";
import { captureImage } from "./capturing";
import { isRunning } from "../runstatus";
import type { Container, Point, SourceElement } from "../types";

const sampleSize = 20; // how many samples to look at at once
const stepsPerRevolution = 300;
const initialSamples = [];
const samples = [];
const outlineOffset = 4; // pixels to subtract from radius
const differenceThreshold = 100;
const cumulativeDifferenceThreshold = 5;
const debounceLength = 5;
const debounce = [];

let sampleIndex = 0;

const getColorAt = (
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  angle: number,
  center: Point,
  radius: number,
  width: number,
  drawPoints = false
): number => {
  const point = getPointFromAngle(angle, center, radius);
  const color = getPointColorFromImageData(data, point, width);
  if(drawPoints) drawPoint(ctx, point, 'red');
  return color.r + color.g + color.b;
};

const changeIsAboveThreshold = (originalColor: number = 0, newColor: number): number => {
  const diff = newColor - originalColor;
  if(diff > differenceThreshold){
    return 1;
  }
  return 0;
};

export const captureOriginalCircle = (container: Container) => {
  const ctx = container.ctx;
  const { width, height } = config.sourceSize;
  const data = ctx.getImageData(0, 0, width, height).data;
  const radius = width / 2 - outlineOffset;
  const center = { x: width / 2, y: height / 2 };

  for (let step = 0; step < stepsPerRevolution; step++) {

    const angle = (step / stepsPerRevolution) * 2 * Math.PI;
    initialSamples[step] = getColorAt(ctx, data, angle, center, radius, width);
  }
  logger.info('original captured');
};

// summing could have been done smarter, but this works fine.
const sum = (samples: Array<number>): number => {
  let sum = 0;
  for(let i = 0; i< samples.length; i++){
    sum += samples[i];
  }
  return sum;
};

export const isCircleOccluded = (videoFrameContainer: Container): boolean => {
  const ctx = videoFrameContainer.ctx;
  const { width, height } = config.sourceSize;
  const data = ctx.getImageData(0, 0, width, height).data;
  const radius = width / 2 - outlineOffset;
  const center = { x: width / 2, y: height / 2 };

  let cumulativeDifference;

  // start enough samples back to fill sample buffer.
  for (let step = -sampleSize; step < stepsPerRevolution; step++) {

    const angle = (step / stepsPerRevolution) * 2 * Math.PI;
    const arrayPos = ((step + stepsPerRevolution) % stepsPerRevolution);
    const originalColor = initialSamples[arrayPos];
    const newColor = getColorAt(ctx, data, angle, center, radius, width, true);
    samples[sampleIndex] = changeIsAboveThreshold(originalColor, newColor);

    if(step >= 0){
      cumulativeDifference = sum(samples);
      if(cumulativeDifference > cumulativeDifferenceThreshold){
        return true;
      }
    }

    sampleIndex = (sampleIndex + 1) % sampleSize;
  }
  return false;
};


const debouncedOccluded = (): boolean => {
  for(let i=0; i<debounceLength; i++){
    if(debounce[i] !== true){
      return false;
    }
  }
  return true;
};

const debouncedNotOccluded = (): boolean => {
  for(let i=0; i<debounceLength; i++){
    if(debounce[i] !== false){
      return false;
    }
  }
  return true;
};

export const waitUntilOccluded = async (
  sourceElement: SourceElement,
  videoFrameContainer: Container
) => {
  for(let i=0; i<debounceLength; i++){
    debounce[i] = false;
  }

  let debounceNum = 0;
  while(!debouncedOccluded() && isRunning()){
    debounce[debounceNum] = isCircleOccluded(videoFrameContainer);
    debounceNum = (debounceNum + 1) % debounceLength;
    await abortable(() => captureImage(sourceElement, videoFrameContainer));
  }
  logger.info('HAND detected');
};

export const waitUntilNotOccluded = async (
  sourceElement: SourceElement,
  videoFrameContainer: Container
) => {
  for(let i=0; i<debounceLength; i++){
    debounce[i] = true;
  }

  let debounceNum = 0;
  while(!debouncedNotOccluded() && isRunning()){
    debounce[debounceNum] = isCircleOccluded(videoFrameContainer);
    debounceNum = (debounceNum + 1) % debounceLength;
    await abortable(() => captureImage(sourceElement, videoFrameContainer));
  }
  logger.info('HAND NOT detected');
};

// TODO: Precalc sample points
// TODO: Preload samples
// TODO: compare with initial.

