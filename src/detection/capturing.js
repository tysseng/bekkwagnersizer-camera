import config from '../config';
import { drawCircle } from "../utils/gfx/draw";

const { videoCircle } = config;
const videoOffsetX = videoCircle.x - videoCircle.diameter / 2;
const videoOffsetY = videoCircle.y - videoCircle.diameter / 2;

const captureVideoToCanvas = (videoElement, container) => {
  const ctx = container.ctx;
  const { width, height } = container.dimensions;

  // capture, crop and scale video, making sure we only get the part of the video frame that
  // contains our circular drawing area.
  ctx.drawImage(videoElement,
    videoOffsetX, videoOffsetY, videoCircle.diameter, videoCircle.diameter, // source
    0, 0, width, height  // target
  );

  // Draw crop circle (...)
  drawCircle(ctx, { x: width / 2, y: width / 2, radius: width / 2 });
};

export const captureBaselineVideoFrame = (videoElement, container) => {
  captureVideoToCanvas(videoElement, container);
};

export const captureWhitePixelsVideoFrame = (videoElement, container) => {
  captureVideoToCanvas(videoElement, container);
};

const captureImageAsVideoFrame = (img, container) => {
  const ctx = container.ctx;
  const { width, height } = container.dimensions;
  ctx.drawImage(img, 0, 0, width, height);
};

export const captureImage = (sourceElement, container) => {
  if(config.source === 'video'){
    captureVideoToCanvas(sourceElement, container);
  } else {
    captureImageAsVideoFrame(sourceElement, container);
  }
};

