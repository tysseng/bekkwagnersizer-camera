import { timed } from "../timer";
import { mapToCanvasImageData } from "./jsfeat.utils";

const padding = 20;

export const drawImageOnCanvas = (imageCanvas, ctx) => {
  timed(() => {
    ctx.drawImage(imageCanvas, 0, 0);
  }, 'draw image on canvas');
};

export const drawBox = (ctx, topLeft, bottomRight) => {
  const x = topLeft.x;
  const y = topLeft.y;
  const height = bottomRight.y - y;
  const width = bottomRight.x - x;

  ctx.beginPath();
  ctx.lineWidth = '1';
  ctx.strokeStyle = 'red';
  ctx.rect(x, y, width, height);
  ctx.stroke();
};

export const drawCorners = (ctx, sheetCorners) => {
  // draw in clockwise order
  drawPoint(ctx, sheetCorners.topLeft, 'red');
  drawPoint(ctx, sheetCorners.topRight, 'green');
  drawPoint(ctx, sheetCorners.bottomRight, 'yellow');
  drawPoint(ctx, sheetCorners.bottomLeft, 'blue');
};

export const drawAllPoints = (ctx, points) => {
  // draw in clockwise order
  points.forEach(point => drawPoint(ctx, point, 'red'))
};

export const drawPoint = (ctx, point, color) => {
  const radius = 6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.stroke();
};

export const drawCircle = (ctx, point) => {
  ctx.beginPath();
  ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI, false);
  ctx.lineWidth = '2';
  ctx.strokeStyle = 'red';
  ctx.stroke();
};

export const drawImageRotatedAroundCenter = (imageCanvas, ctx, width, height, angle) => {
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);
  ctx.translate(-width / 2, -height / 2);
  drawImageOnCanvas(imageCanvas, ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

export const drawJsFeatImageOnContext = (jsFeatImage, ctx, width, height) => {
  const imageData = timed(() => ctx.getImageData(0, 0, width, height), 'get image data');
  mapToCanvasImageData(jsFeatImage, imageData);
  timed(() => ctx.putImageData(imageData, 0, 0), 'put image to ctx');
};

export const floodFill = (ctx, r, g, b, a) => {
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  ctx.fillFlood(padding * 2, padding * 2, 32);
};
