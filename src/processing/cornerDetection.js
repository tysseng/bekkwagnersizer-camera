import jsfeat from 'jsfeat';

// threshold on difference between intensity of the central pixel
// and pixels of a circle around this pixel
const fastCornersThreshold = 15;
const fastCornersBorder = 5; //3 ok with fast corners

// 3 box blur with radius 3 seems to remove dust from a 1024 x 1365 image
const blurRadius = 4;

/*
Yape06 detected all corners with the following:
border = 5
blur = 4
blurredImage
 */

const findCorners = (image) => {

  // TODO: Hvis man ikke finner fire hjørner som toucher bounding box, roter 20 grader og prøv igjen.

  jsfeat.fast_corners.set_threshold(fastCornersThreshold);

  const corners = [];
  for (let i = 0; i < image.cols * image.rows; ++i) {
    corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0);
  }

  //const count = jsfeat.fast_corners.detect(image, corners, fastCornersBorder);

  //yape06 works well with blurred image, not at all with the others
  const count = jsfeat.yape06.detect(image, corners, fastCornersBorder);
  return corners.slice(0, count);
};

export const detectCornersUsingOriginalImage = (image, width, height) => {
  return findCorners(image);
};

export const detectCornersUsingDownscaledImage = (image, width, height) => {
  const scaleFactor = 4;
  const scaleHeight = Math.floor(height / scaleFactor);
  const scaleWidth = Math.floor(width / scaleFactor);
  const scaledImg = new jsfeat.matrix_t(Math.floor(scaleWidth), Math.floor(scaleHeight), jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.resample(image, scaledImg, scaleWidth, scaleHeight);

  return findCorners(scaledImg).map(corner => ({
    x: corner.x * scaleFactor,
    y: corner.y * scaleFactor
  }));
};

export const detectCornersUsingBlurredImage = (image, width, height) => {
  // remove dust! without this it corner detection will trigger on the dust particles
  const blurredImage = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.box_blur_gray(image, blurredImage, blurRadius);
  return findCorners(blurredImage);
};