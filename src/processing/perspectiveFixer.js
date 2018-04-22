import fixperspective from 'fix-perspective';

const getPerspectiveCorrectionTransform = (orderedCorners, width, height) => {
  const from = [
    orderedCorners.bottomLeft,
    orderedCorners.topLeft,
    orderedCorners.topRight,
    orderedCorners.bottomRight,
  ];
  const to = [
    {x: 0, y: height},
    {x: 0, y: 0},
    {x: width, y: 0},
    {x: width, y: height},
  ];

  return fixperspective(from, to);
};

const copyPixel = (sourceImgData, targetImgData, from, to, width) => {
  const sourcePos = (from.x * width + from.y) * 4;
  const destPos = (Math.floor(to.x) * width + Math.floor(to.y)) * 4;

  targetImgData.data[destPos] = sourceImgData.data[sourcePos];
  targetImgData.data[destPos+1] = sourceImgData.data[sourcePos+1];
  targetImgData.data[destPos+2] = sourceImgData.data[sourcePos+2];
  targetImgData.data[destPos+3] = sourceImgData.data[sourcePos+3];
};

const padEmptyPixels = (imageData) => {
  const data = imageData.data;
  let r = 120;
  let g = 120;
  let b = 120;
  let a = 120;
  for(i= 0; i< width*height*4; i+=4){
    if(data[i] === 0 && data[i+1] === 0 && data[i+2] === 0 && data[i+3] === 0){
      data[i] = r;
      data[i+1] = g;
      data[i+2] = b;
      data[i+3] = a;
    } else {
      r = data[i];
      g = data[i+1];
      b = data[i+2];
      a = data[i+3];
    }
  }
};

export const correctPerspective = (ctx, targetCtx, boundingBox, transform, width, height) => {
  let x, y;
  let i = 0;

  const imageData = ctx.getImageData(x, y, width, height);
  const targetImageData = targetCtx.getImageData(x, y, width, height);

  for(y = boundingBox.topLeft.y; y < boundingBox.bottomRight.y; y++){
    for(x = boundingBox.topLeft.x; x < boundingBox.bottomRight.x; x++){
      const out = transform(x, y);
      if(out.x < 0 || out.y < 0 || out.x > 599 || out.y > 799){
        continue;
      }
      i++;
      copyPixel(imageData, targetImageData, {x,y}, out, width);
      //if(i>20) break;
    }
    //if(i>20) break;
  }

  padEmptyPixels(targetImageData);
  targetCtx.putImageData(targetImageData, 0, 0);
};
