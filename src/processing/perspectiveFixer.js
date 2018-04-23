import fixperspective from 'fix-perspective';

export const getPerspectiveCorrectionTransform = (orderedCorners, width, height) => {
  const from = [
    orderedCorners.topLeft,
    orderedCorners.topRight,
    orderedCorners.bottomRight,
    orderedCorners.bottomLeft,
  ];
  const to = [
    {x: 0, y: 0},
    {x: width-1, y: 0},
    {x: width-1, y: height-1},
    {x: 0, y: height-1},
  ];

  return fixperspective(from, to);
};

const copyPixel = (sourceImgData, targetImgData, from, to, width, height) => {
  const sourcePos = (from.y * width + from.x) * 4;
  const destPos = (Math.floor(to.y) * width + Math.floor(to.x)) * 4;

  targetImgData.data[destPos] = sourceImgData.data[sourcePos];
  targetImgData.data[destPos+1] = sourceImgData.data[sourcePos+1];
  targetImgData.data[destPos+2] = sourceImgData.data[sourcePos+2];
  targetImgData.data[destPos+3] = sourceImgData.data[sourcePos+3];
};

const padEmptyPixels = (imageData, width, height) => {
  const data = imageData.data;
  let r = 120;
  let g = 120;
  let b = 120;
  let a = 120;
  for(let i= 0; i< width*height*4; i+=4){
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

export const correctPerspective = (ctx, targetCtx, boundingBox, transform, width, height, orderedCorners) => {
  let x, y;
  let i = 0;

  const imageData = ctx.getImageData(x, y, width, height);
  const targetImageData = targetCtx.getImageData(x, y, width, height);

  for(y = 0; y < height; y++){
    for(x = 0; x < width; x++){
      const out = transform(x, y);
      if(out.x < 0 || out.y < 0 || out.x > 599 || out.y > 799) continue;
      i++;
      copyPixel(imageData, targetImageData, {x,y}, out, width, height);
    }
  }

  padEmptyPixels(targetImageData, width, height);
  targetCtx.putImageData(targetImageData, 0, 0);
};
