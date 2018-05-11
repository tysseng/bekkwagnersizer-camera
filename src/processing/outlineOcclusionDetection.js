// try to figure out when something (like a hand) enters the circle
import config from "../config";
import { getPointFromAngle } from "./trigonometry";
import { getColorFromImageData } from "./context.utils";

const sampleSize = 10; // how many samples to look at at once
const stepsPerRevolution = 100;
const initialSamples = [];
const samples = [];
const outlineOffset = 4; // pixels to subtract from radius
const differenceThreshold = 100;
const cumulativeDifferenceThreshold = 5;

let sampleIndex = 0;

const getColorAt = (ctx, data, angle, center, radius, width) => {
  const point = getPointFromAngle(angle, center, radius);
  const color = getColorFromImageData(data, point, width);
  return color.r + color.g + color.b;
};

const changeIsAboveThreshold = (originalColor = 0, newColor) => {
  const diff = Math.abs(originalColor - newColor);
  if(diff > differenceThreshold){
    //console.log('diff above treshold', diff);
    return 1;
  }
  return 0;
};

export const captureOriginalCircle = (ctx) => {
  const { width, height } = config.videoFrameSize;
  const data = ctx.getImageData(0, 0, width, height).data;
  const radius = width / 2 - outlineOffset;
  const center = { x: width / 2, y: height / 2 };

  for (let step = 0; step < stepsPerRevolution; step++) {

    const angle = (step / stepsPerRevolution) * 2 * Math.PI;
    initialSamples[step] = getColorAt(ctx, data, angle, center, radius, width);
    console.log('init', step, initialSamples[step]);
  }
  console.log('original captured');
};

// summing could have been done smarter, but this works fine.
const sum = (samples) => {
  let sum = 0;
  for(let i = 0; i< samples.length; i++){
    sum += samples[i];
  }
  return sum;
};

export const isCircleOccluded = (ctx) => {
  const { width, height } = config.videoFrameSize;
  const data = ctx.getImageData(0, 0, width, height).data;
  const radius = width / 2 - outlineOffset;
  const center = { x: width / 2, y: height / 2 };

  // start enough samples back to fill sample buffer.
  for (let step = -sampleSize; step < stepsPerRevolution; step++) {

    const angle = (step / stepsPerRevolution) * 2 * Math.PI;
    const arrayPos = ((step + stepsPerRevolution) % stepsPerRevolution);
    const originalColor = initialSamples[arrayPos];
    const newColor = getColorAt(ctx, data, angle, center, radius, width);

    samples[sampleIndex] = changeIsAboveThreshold(originalColor, newColor);

    if(step >= 0){
      const cumulativeDifference = sum(samples);
      if(cumulativeDifference > cumulativeDifferenceThreshold){
        return true;
      }
    }

    sampleIndex = (sampleIndex + 1) % sampleSize;
  }
};

// TODO: Precalc sample points
// TODO: Preload samples
// TODO: compare with initial.


