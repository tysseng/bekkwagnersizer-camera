import jsfeat from 'jsfeat';

const drawImageOnCanvas = (ctx) => {
  const img = document.getElementById("sourceImage");
  ctx.drawImage(img, 0, 0);
};

const writeToGrayscaleImageData = (image_data, img) => {
  const data_u32 = new Uint32Array(image_data.data.buffer);
  const alpha = (0xff << 24);

  let i = img.cols * img.rows, pix = 0;
  while (--i >= 0) {
    pix = img.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
};

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
    // TODO: find remaining corners, find ordering
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
};

const findBoundingBox = (corners) => {
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

const drawBoundingBox = (ctx, bb) => {
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

const drawPoint = (ctx, point, color) => {
  const radius = 6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.stroke();
};

const drawCorners = (ctx, orderedCorners) => {
  // draw in clockwise order
  drawPoint(ctx, orderedCorners.topLeft, 'red');
  drawPoint(ctx, orderedCorners.topRight, 'green');
  drawPoint(ctx, orderedCorners.bottomRight, 'yellow');
  drawPoint(ctx, orderedCorners.bottomLeft, 'blue');
};

const findCorners = (img) => {
  // threshold on difference between intensity of the central pixel
  // and pixels of a circle around this pixel
  const threshold = 30;
  const border = 3;

  jsfeat.fast_corners.set_threshold(threshold);
  const corners = [];

  // you should use preallocated keypoint_t array
  for (let i = 0; i < img.cols * img.rows; ++i) {
    corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0);
  }

  // perform detection
  // returns the amount of detected corners
  const count = jsfeat.fast_corners.detect(img, corners, border);
  return corners.slice(0, count);
};

const process = (ctx, width, height) => {
  const image_data = ctx.getImageData(0, 0, width, height);
  const gray_img = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(image_data.data, width, height, gray_img);

  const corners = findCorners(gray_img);
  const boundingBox = findBoundingBox(corners);
  const orderedCorners = findBoundingCorners(boundingBox, corners);
  console.log('corners', corners);
  console.log('bounding box', boundingBox);
  console.log('orderedCorners', orderedCorners);


  writeToGrayscaleImageData(image_data, gray_img);
  ctx.putImageData(image_data, 0, 0);
  drawBoundingBox(ctx, boundingBox);
  drawCorners(ctx, orderedCorners);
};

export default (ctx, width, height) => {
  drawImageOnCanvas(ctx);
  process(ctx, width, height);
}
