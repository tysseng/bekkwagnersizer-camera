import jsfeat from 'jsfeat';

const drawImageOnCanvas = (ctx) => {
  const img=document.getElementById("sourceImage");
  ctx.drawImage(img,0,0);
};

function writeToGrayscaleImageData(image_data, img){
  var data_u32 = new Uint32Array(image_data.data.buffer);
  var i = img.cols*img.rows, pix = 0;

  var alpha = (0xff << 24);
  while(--i >= 0) {
    pix = img.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
}


function topCornerFilter(boundingBox){
  return function (corner){
    return corner.y === boundingBox.topLeft.y;
  }
}

function leftCornerFilter(boundingBox){
  return function (corner){
    return corner.x === boundingBox.topLeft.x;
  }
}

function rightCornerFilter(boundingBox){
  return function (corner){
    return corner.x === boundingBox.bottomRight.x;
  }
}

function bottomCornerFilter(boundingBox){
  return function (corner){
    return corner.y === boundingBox.bottomRight.y;
  }
}


function findBoundingCorners(boundingBox, corners){

  var topLeft, topRight, bottomLeft, bottomRight;

  var topCorners = corners.filter(topCornerFilter(boundingBox));
  if(topCorners.length == 2){
    if(topCorners[0].x < topCorners[1].x){
      topLeft = topCorners[0];
      topRight = topCorners[1];
    } else {
      topLeft = topCorners[1];
      topRight = topCorners[0];
    }
    // TODO: find remaining corners, find ordering
  } else if(topCorners.length == 1){
    var topCorner = topCorners[0];
    var leftCorner = corners.find(leftCornerFilter(boundingBox));
    var rightCorner = corners.find(rightCornerFilter(boundingBox));
    var bottomCorner = corners.find(bottomCornerFilter(boundingBox));

    if(leftCorner.y < rightCorner.y){
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
}

function findVerticalIntersectingCorners(boundingBox, corners){

}

function findHorizontalIntersectingCorners(boundingBox, corners){

}

function findBoundingBox(corners){
  var minX = Number.MAX_VALUE;
  var maxX = -1;
  var minY = Number.MAX_VALUE;
  var maxY = -1;

  for(var i=0; i<corners.length; i++) {
    var corner = corners[i];
    if(corner.x < minX){minX = corner.x;}
    if(corner.x > maxX){maxX = corner.x;}
    if(corner.y < minY){minY = corner.y;}
    if(corner.y > maxY){maxY = corner.y;}
  }

  return {
    topLeft: {x: minX, y: minY},
    bottomRight: {x: maxX, y: maxY}
  };
}

function drawBoundingBox(ctx, bb){
  var x = bb.topLeft.x;
  var y = bb.topLeft.y;
  var height = bb.bottomRight.y - y;
  var width = bb.bottomRight.x - x;

  ctx.beginPath();
  ctx.lineWidth='1';
  ctx.strokeStyle='red';
  ctx.rect(x, y, width, height);
  ctx.stroke();

}

function drawPoint(ctx, point, color){
  var radius = 6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.stroke();
}

function drawCorners(ctx, orderedCorners){
  // draw in clockwise order
  drawPoint(ctx, orderedCorners.topLeft, 'red');
  drawPoint(ctx, orderedCorners.topRight, 'green');
  drawPoint(ctx, orderedCorners.bottomRight, 'yellow');
  drawPoint(ctx, orderedCorners.bottomLeft, 'blue');
}

function findCorners(img){
  // threshold on difference between intensity of the central pixel
  // and pixels of a circle around this pixel
  var threshold = 30;
  jsfeat.fast_corners.set_threshold(threshold);

  var corners = [];
  var border = 3;

  // you should use preallocated keypoint_t array
  for(var i = 0; i < img.cols*img.rows; ++i) {
    corners[i] = new jsfeat.keypoint_t(0,0,0,0);
  }

  // perform detection
  // returns the amount of detected corners
  var count = jsfeat.fast_corners.detect(img, corners, border);

  return corners.slice(0, count);
}

function process(ctx, width, height) {
  var image_data = ctx.getImageData(0, 0, width, height);
  var gray_img = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(image_data.data, width, height, gray_img);

  var corners = findCorners(gray_img);
  var boundingBox = findBoundingBox(corners);
  var orderedCorners = findBoundingCorners(boundingBox, corners);
  console.log('corners', corners);
  console.log('bounding box', boundingBox);
  console.log('orderedCorners', orderedCorners);


  writeToGrayscaleImageData(image_data, gray_img);
  ctx.putImageData(image_data, 0, 0);
  drawBoundingBox(ctx, boundingBox);
  drawCorners(ctx, orderedCorners);
}

export default (ctx, width, height) => {
  drawImageOnCanvas(ctx);
  process(ctx, width, height);
}
