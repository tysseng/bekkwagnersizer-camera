export default {
  showSteps: true,
  videoSize: {
    width: 1920,
    height: 1080,
  },
  videoFrameSize: {
    width: 1024,
    height: 1024,
  },
  videoCircle: { // relative to videoSize
    x: 1415,
    y: 975,
    radius: 895,
  },
  sheetSize: {
    width: 1365,
    height: 1024,
  },
  debug: {
    drawSheetCorners: true,
    drawBoundingBox: true,
    drawAllCorners: true,
  },

  // center of EDawards star
  logoDetectionPosition: {x: 101, y: 110},

  // bounding box for removing logo
  logoBoundingBox: {x: 40, y: 48, width: 480, height: 120}
}

