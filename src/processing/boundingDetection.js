
export const findBoundingCorners = (boundingBox, corners) => {

  let topLeft, topRight, bottomLeft, bottomRight;

  const topCorners = corners.filter(corner => corner.y === boundingBox.topLeft.y);
  const leftCorners = corners.filter(corner => corner.x === boundingBox.topLeft.x);
  const rightCorners = corners.filter(corner => corner.x === boundingBox.bottomRight.x);
  const bottomCorners = corners.filter(corner => corner.y === boundingBox.bottomRight.y);

  console.log({topCorners, leftCorners, rightCorners, bottomCorners});

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

  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomLeft: bottomLeft,
    bottomRight: bottomRight,
  }

};

/*
const findBoundingCorners = (boundingBox, corners) => {

  let topLeft, topRight, bottomLeft, bottomRight;

  const topCorners = corners.filter(corner => corner.y === boundingBox.topLeft.y);
  if (topCorners.length === 2) {
    if (topCorners[0].x < topCorners[1].x) {
      topLeft = topCorners[0];
      topRight = topCorners[1];
    } else {
      topLeft = topCorners[1];
      topRight = topCorners[0];
    }
    // TODO: find remaining corners, find ordering.
    // TODO: find corners even if one is not at an extreme
  } else if (topCorners.length === 1) {
    const topCorner = topCorners[0];
    const leftCorner = corners.find(corner => corner.x === boundingBox.topLeft.x);
    const rightCorner = corners.find(corner => corner.x === boundingBox.bottomRight.x);
    const bottomCorner = corners.find(corner => corner.y === boundingBox.bottomRight.y);

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

    return {
      topLeft: topLeft,
      topRight: topRight,
      bottomLeft: bottomLeft,
      bottomRight: bottomRight,
    }
  }
};*/

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