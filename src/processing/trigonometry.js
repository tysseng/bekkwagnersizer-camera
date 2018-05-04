export const distance = (point1, point2) => {
  const x = point2.x - point1.x;
  const y = point2.y - point1.y;
  return Math.sqrt(x * x + y * y);
};