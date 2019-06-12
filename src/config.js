// 'image', 'video'
import { flipDetectionMethods } from "./processing/flipDetectionMethods";

const source = 'video';
//const source = 'image';

const videoFrameSize = {
  width: 1024,
  height: 1024,
};

// size of image used as input if source = image
const imageSize = {
  width: 1024,
  height: 1365,
};

const sheetSizeA4 = {
  width: 210,
  height: 297,
};

const sheetSizeA3 = {
  width: 297,
  height: 410,
};

const sheetSizeMM = sheetSizeA3;

const sheetWidthPixels = 1024;
const sheetPPMM = sheetWidthPixels / sheetSizeMM.width;

// center of EDawards star
const logoDetectionPositionMM = {
  x: 21.4,
  y: 23.95,
};

// bounding box for removing logo, x,y is top left corner
const logoBoundingBoxMM = {
  x: 9,
  y: 11,
  width: 92,
  height: 24
};

// where to find bit dots (to indicate what image this is)
const bitPositionYMM = sheetSizeMM.height - 18;
const bitPositionsMM = [
  { x: sheetSizeMM.width - 88, y: bitPositionYMM },
  { x: sheetSizeMM.width - 70, y: bitPositionYMM },
  { x: sheetSizeMM.width - 54, y: bitPositionYMM },
  { x: sheetSizeMM.width - 36, y: bitPositionYMM },
  { x: sheetSizeMM.width - 19, y: bitPositionYMM },
];

const bitPositions = bitPositionsMM.map(
  pos => ({
    x: Math.floor(pos.x * sheetPPMM),
    y: Math.floor(pos.y * sheetPPMM)
  }));

// color calibration pads position in millimeters
const colorRowsMM = [40, 85, 135, 180, 230, 290];
const colorColsMM = [80, 210];

const colorRows = colorRowsMM.map(pos => Math.floor(pos * sheetPPMM));
const colorCols = colorColsMM.map(pos => Math.floor(pos * sheetPPMM));

const colorPositions = {
  blue:  {x: colorCols[0], y: colorRows[0]},
  green:  {x: colorCols[1], y: colorRows[0]},
  purple:  {x: colorCols[1], y: colorRows[1]},
  white:  {x: colorCols[0], y: colorRows[5]},
  black:  {x: colorCols[1], y: colorRows[4]},
};

export default {
  source,

  // while looping - require occlusion of outline before trying to capture new image
  // NB: Hand detection does not work with image, only video.
  detectHand: source === 'video',

  // set this to false to debug with image without bounds
  preventDetectionOutsideBoundingCicle: source === 'video',

  // block processing if detected corners are the same as last time
  preventDuplicates: true,

  // Add padding around the sheet before flood filling, this makes it possible to flood fill all
  // around even if the user has drawn lines all the way to the edge
  padBeforeFloodFilling: true,

  // default value for upload after capture checkbox.
  defaultUploadAfterCapture: true,

  // show how long each step takes.
  showTimings: true,

  // use perspective correction when extracting sheet. A faster but less accurate option is to
  // detect sheet orientation and rotate sheet but not resample. This works if we can guarantee
  // that the photo has been taken perpendicular to both the sheet x and y axis.
  // values: 'exact', 'approximate'
  sheetCorrection: 'exact',

  // Flip correction checks if sheet has been placed upside down. It can use either logo or bitcode
  // to decide if sheet is upside down. If none are chosen, no flip will be done and sheet may end
  // up upside down. Possible options: 'logo', 'bitcode', 'none'.
  flipCorrection: flipDetectionMethods.BITCODE,

  // Final crop border size - how much to crop away to make sure we don't get a border
  finalCrop: 10,

  // center of logo to use when removing logo
  removeLogo: false,
  logoDetectionPosition: {
    x: Math.floor(logoDetectionPositionMM.x * sheetPPMM),
    y: Math.floor(logoDetectionPositionMM.y * sheetPPMM),
  },

  // bounding box for removing logo
  logoBoundingBox: {
    x: Math.floor(logoBoundingBoxMM.x * sheetPPMM),
    y: Math.floor(logoBoundingBoxMM.y * sheetPPMM),
    width: Math.floor(logoBoundingBoxMM.width * sheetPPMM),
    height: Math.floor(logoBoundingBoxMM.height * sheetPPMM),
  },

  // where to find bit dots (to indicate what image this is)
  removeBitcode: true,
  bitPositions,
  bitPositionPadding: 25,

  // where to find colors to use for calibration
  colorPositions,
  colorBitcode: 30, // TODO - wrong code

  videoSize: {
    width: 1920,
    height: 1080,
  },

  /*
  //4K cam
  videoCircle: { // relative to videoSize
    x: 2950,
    y: 2010,
    diameter: 1840,
  },
*/
  //HD cam
  /*
  // Full circle
  videoCircle: { // relative to videoSize
    x: 1470,
    y: 1010,
    diameter: 920,
  },
  */

  videoCircle: { // relative to videoSize
    x: 2010 / 2,
    y: 1080 / 2,
    diameter: 920,
  },
  /*
  videoCircle: { // relative to videoSize
    x: 1440,
    y: 980,
    diameter: 870,
  },*/

  sourceSize: source === 'video' ? videoFrameSize : imageSize,

  sheetSize: {
    width: sheetWidthPixels,
    height: Math.floor(sheetSizeMM.height * sheetPPMM),
  },

  uploadSize: {
    width: 512,
    height:512,
  },
  uploadFile: true,
  uploadUrls: [
    'http://169.254.43.21:3000/image',
  ],

  debug: {
    drawSheetCorners: true,
    drawBoundingBox: true,
    drawAllCorners: true,
  },
}

