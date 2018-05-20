export const sortByX = (corners) => corners.sort((corner1, corner2) => corner1.x - corner2.x);

export const copyAndSortByY = (points) => {
  let i = points.length;
  const pointsCopy = [];
  while (i--) pointsCopy[i] = points[i];
  return pointsCopy.sort((point1, point2) => point1.y - point2.y);
};

export const isSamePoint = (oldCorner, newCorner, margin) => {
  return Math.abs(oldCorner.x - newCorner.x) < margin &&
    Math.abs(oldCorner.y - newCorner.y) < margin;
};
