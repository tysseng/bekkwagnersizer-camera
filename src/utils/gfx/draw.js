// @flow
import 'floodfill';
import { timed } from "../timer";
import { mapToCanvasImageData } from "./jsfeat.utils";
import type { Container, HexColor, JsFeatImage, Point, RgbaColor, SheetCorners } from "../../types";

export const drawImageOnContext = (source: Container, target: Container) => {
  timed(() => {
    target.ctx.drawImage(source.canvas, 0, 0);
  }, 'draw image on canvas');
};

export const drawBox = (ctx: CanvasRenderingContext2D, topLeft: Point, bottomRight: Point) => {
  const x = topLeft.x;
  const y = topLeft.y;
  const height = bottomRight.y - y;
  const width = bottomRight.x - x;

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.rect(x, y, width, height);
  ctx.stroke();
};

export const drawCorners = (ctx: CanvasRenderingContext2D, sheetCorners: SheetCorners) => {
  // draw in clockwise order
  drawPoint(ctx, sheetCorners.topLeft, 'red');
  drawPoint(ctx, sheetCorners.topRight, 'green');
  drawPoint(ctx, sheetCorners.bottomRight, 'yellow');
  drawPoint(ctx, sheetCorners.bottomLeft, 'blue');
};

export const drawAllPoints = (ctx: CanvasRenderingContext2D, points: Array<Point>) => {
  // draw in clockwise order
  points.forEach(point => drawPoint(ctx, point, 'red'))
};

export const drawPoint = (ctx: CanvasRenderingContext2D, point: Point, color: HexColor) => {
  const radius = 6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.stroke();
};

export const drawCircle = (ctx: CanvasRenderingContext2D, point: Point, radius: number) => {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.stroke();
};

export const drawImageRotatedAroundCenter = (
  source: Container, target: Container, angle: number
) => {
  const targetCtx = target.ctx;

  const { width, height } = target.dimensions;
  targetCtx.translate(width / 2, height / 2);
  targetCtx.rotate(angle);
  targetCtx.translate(-width / 2, -height / 2);
  drawImageOnContext(source, target);
  targetCtx.setTransform(1, 0, 0, 1, 0, 0);
};

export const drawJsFeatImageOnContext = (jsFeatImage: JsFeatImage, container: Container) => {
  const ctx = container.ctx;
  const { width, height} = container.dimensions;
  const imageData = timed(() => ctx.getImageData(0, 0, width, height), 'get image data');
  mapToCanvasImageData(jsFeatImage, imageData);
  container.gray = jsFeatImage;
  timed(() => ctx.putImageData(imageData, 0, 0), 'put image to ctx');
};

export const floodFill = (
  ctx: CanvasRenderingContext2D, startPos: Point, {r, g, b, a}: RgbaColor
) => {
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

  // TODO: Add flow exception. fillFlood is added by floodfill lib
  ctx.fillFlood(startPos.x, startPos.y, 32);
};
