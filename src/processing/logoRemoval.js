import config from '../config';

export const removeLogo = (ctx) => {
  const {x, y, width, height} = config.logoBoundingBox;
  ctx.beginPath();
  ctx.fillRect(x, y, width, height);
  ctx.stroke();
};