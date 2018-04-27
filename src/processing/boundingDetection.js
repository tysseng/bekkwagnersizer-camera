
export const findBoundingCorners = (boundingBox, corners) => {

  let topLeft, topRight, bottomLeft, bottomRight;

  // negation is to make sure a corner does not intersect to lines of the bounding box. if it does,
  // the corner will appear in two of the corner detections and we will either get too many or
  // too few corners.
  const topCorners = corners.filter(corner => corner.x !== boundingBox.topLeft.x && corner.y === boundingBox.topLeft.y);
  const leftCorners = corners.filter(corner => corner.x === boundingBox.topLeft.x && corner.y !== boundingBox.topLeft.y);
  const rightCorners = corners.filter(corner => corner.x === boundingBox.bottomRight.x && corner.y !== boundingBox.bottomRight.y);
  const bottomCorners = corners.filter(corner => corner.x !== boundingBox.bottomRight.x && corner.y === boundingBox.bottomRight.y);

  if(
    topCorners.length !== 1 ||
    leftCorners.length !== 1 ||
    rightCorners.length !== 1 ||
    bottomCorners.length !== 1
  ) {
    throw Error('Sheet may be too much aligned with camera, rotate slightly and try again')
  }

  const topCorner = topCorners[0];
  const leftCorner = leftCorners[0];
  const rightCorner = rightCorners[0];
  const bottomCorner = bottomCorners[0];

  if (leftCorner.y < rightCorner.y) {
    topLeft = leftCorner;
    topRight = topCorner;
    bottomLeft = bottomCorner;
    bottomRight = rightCorner;
  } else {
    topLeft = topCorner;
    topRight = rightCorner;
    bottomLeft = leftCorner;
    bottomRight = bottomCorner;
  }

  // make sure corners are not equal

  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomLeft: bottomLeft,
    bottomRight: bottomRight,
  }
};


export const findBoundingBox = (corners) => {
  let minX = Number.MAX_VALUE;
  let maxX = -1;
  let minY = Number.MAX_VALUE;
  let maxY = -1;

  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i];
    if (corner.x < minX) {
      minX = corner.x;
    }
    if (corner.x > maxX) {
      maxX = corner.x;
    }
    if (corner.y < minY) {
      minY = corner.y;
    }
    if (corner.y > maxY) {
      maxY = corner.y;
    }
  }

  return {
    topLeft: { x: minX, y: minY },
    bottomRight: { x: maxX, y: maxY }
  };
};