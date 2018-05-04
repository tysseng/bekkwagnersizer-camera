const logoCenter = {x: 101, y: 110};
const logoSamplePadding = 5;

const getAverageColor = (image, x, y, width) => {
  let sum = 0;
  let area = (2 * logoSamplePadding + 1) * (2 * logoSamplePadding + 1);
  for (let col = x - logoSamplePadding; col <= x + logoSamplePadding; col++) {
    for (let row = y - logoSamplePadding; row <= y + logoSamplePadding; row++) {
      sum +=image.data[row * width + col];
    }
  }
  return sum/area;
};

export const isLogoInCorrectCorner = (image, width, height) => {
  const topLeftColor = getAverageColor(image, logoCenter.x, logoCenter.y, width);
  const bottomRightColor = getAverageColor(image, width - logoCenter.x, height - logoCenter.y, width);

  if(topLeftColor < bottomRightColor) { // logo is black
    console.log("LOGO: logo is in correct corner");
    return true;
  } else {
    console.log("LOGO: logo is in wrong corner, rotate sheet!");
    return false;
  }
}