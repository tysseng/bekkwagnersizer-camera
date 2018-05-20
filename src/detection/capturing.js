import config from '../config';
import { drawCircle } from "../utils/gfx/draw";

const { videoCircle } = config;
const videoOffsetX = videoCircle.x - videoCircle.radius;
const videoOffsetY = videoCircle.y - videoCircle.radius;

const captureVideoToCanvas = (ctx, videoElement) => {
  const { width, height } = config.sourceSize;

  // capture, crop and scale video, making sure we only get the part of the video frame that
  // contains our circular drawing area.
  ctx.drawImage(videoElement,
    videoOffsetX, videoOffsetY, videoCircle.radius, videoCircle.radius, // source
    0, 0, width, height); // target

  // Draw crop circle (...)
  drawCircle(ctx, { x: width / 2, y: width / 2, radius: width / 2 });
};

const captureVideoFrame = (canvases, videoElement) => {

  const ctx = canvases.videoFrame.ctx;
  captureVideoToCanvas(ctx, videoElement);
};

export const captureBaselineVideoFrame = (canvases, videoElement) => {
  const ctx = canvases.baselineVideoFrame.ctx;
  captureVideoToCanvas(ctx, videoElement);
};

const captureImageToCanvas = (ctx, img) => {
  const { width, height } = config.sourceSize;
  ctx.drawImage(img, 0, 0, width, height);
};

const captureImageAsVideoFrame = (canvases, img ) => {
  const ctx = canvases.videoFrame.ctx;
  captureImageToCanvas(ctx, img);
};

export const captureImage = (canvases, sourceElement) => {
  if(config.source === 'video'){
    captureVideoFrame(canvases, sourceElement);
  } else {
    captureImageAsVideoFrame(canvases, sourceElement);
  }
};

