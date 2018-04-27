import { timed } from "../utils/timer";

const padding = 20;

export const drawImageOnCanvas = (ctx) => {
  timed(() => {
    const img = document.getElementById("sourceImage");
    ctx.drawImage(img, 0, 0);
  }, 'draw image on canvas');
};

export const drawBoundingBox = (ctx, bb) => {
  const x = bb.topLeft.x;
  const y = bb.topLeft.y;
  const height = bb.bottomRight.y - y;
  const width = bb.bottomRight.x - x;

  ctx.beginPath();
  ctx.lineWidth = '1';
  ctx.strokeStyle = 'red';
  ctx.rect(x, y, width, height);
  ctx.stroke();
};

export const drawCorners = (ctx, orderedCorners) => {
  // draw in clockwise order
  drawPoint(ctx, orderedCorners.topLeft, 'red');
  drawPoint(ctx, orderedCorners.topRight, 'green');
  drawPoint(ctx, orderedCorners.bottomRight, 'yellow');
  drawPoint(ctx, orderedCorners.bottomLeft, 'blue');
};

export const drawAllCorners = (ctx, corners) => {
  // draw in clockwise order
  corners.forEach(corner => drawPoint(ctx, corner, 'red'))
};

const drawPoint = (ctx, point, color) => {
  const radius = 6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.stroke();
};

export const floodFill = (ctx, r, g, b, a) => {
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  ctx.fillFlood(padding * 2, padding * 2, 32);
};
