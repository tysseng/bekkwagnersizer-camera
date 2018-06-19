// @flow
// 'image', 'video'
import { flipDetectionMethods } from "./processing/flipDetectionMethods";
import pushwagnerSceneConfig from "./pushwagner/pushwagnerSceneConfig";
import type { Size, Point } from "./types";
import objMapper from "./utils/objectKeyMapper";
import { getInPixels, getPointInPixels, getPPMM, getSizeInPixels } from "./utils/config.utils";

// Color mappings and other stuff specific to a certain installation (e.g. pushwagner)
const availableScenes = { PUSHWAGNER: 'pushwagner' };
const sceneConfigs = { [availableScenes.PUSHWAGNER]: pushwagnerSceneConfig };
const sceneConfig = sceneConfigs[availableScenes.PUSHWAGNER]; // change key to switch scene

const sheetWidthPixels = 1024;
const sheetPPMM = getPPMM(sheetWidthPixels, sceneConfig.sheetSizeMM.width);
const sheetSize: Size = {
  width: sheetWidthPixels,
  height: getInPixels(sceneConfig.sheetSizeMM.height, sheetPPMM),
};

const logoDetectionPosition = getPointInPixels(
  sceneConfig.logoDetectionPositionMM,
  sheetPPMM
);

const bitPositions: Array<Point> = sceneConfig.bitPositionsMM.map(
  point => getPointInPixels(point, sheetPPMM)
);

const calibrationColorPositions = objMapper(
  sceneConfig.calibrationColorPositionsMM,
  (entry: Point) => ({
    x: getInPixels(entry.x, sheetPPMM),
    y: getInPixels(entry.y, sheetPPMM)
  })
);

const videoFrameSize: Size = {
  width: 1024,
  height: 1024,
};

// size of image used as input if source = image
const imageSize: Size = {
  width: 1024,
  height: 1365,
};

// Final crop border size - how much to crop away to make sure we don't get a border
const finalCrop = 10;

const source = 'video';

const config = {
  source,

  // while looping - require occlusion of outline before trying to capture new image
  // NB: Hand detection does not work with image, only video.
  detectHand: source === 'video',

  // set this to false to debug with image without bounds
  preventDetectionOutsideBoundingCicle: source === 'video',

  // block processing if detected corners are the same as last time
  preventDuplicates: true,

  // default value for upload after capture checkbox.
  defaultUploadAfterCapture: true,

  // show how long each step takes.
  showTimings: true,

  // Flip correction checks if sheet has been placed upside down. It can use either logo or bitcode
  // to decide if sheet is upside down. If none are chosen, no flip will be done and sheet may end
  // up upside down. Possible options: 'logo', 'bitcode', 'none'.
  flipCorrection: flipDetectionMethods.BITCODE,

  // center of logo to use when removing logo
  removeLogo: false,

  logoDetectionPosition,

  // bounding box for removing logo
  logoBoundingBox: {
    ...getPointInPixels(sceneConfig.logoBoundingBoxMM.upperLeft, sheetPPMM),
    ...getSizeInPixels(sceneConfig.logoBoundingBoxMM.size, sheetPPMM),
  },

  bitPositions,
  bitPositionPadding: 25,

  // where to find colors to use for calibration
  calibrationColorPositions,

  videoSize: { width: 1920, height: 1080 },

  videoCircle: { x: 1000, y: 555, diameter: 900 },

  sourceSize: source === 'video' ? videoFrameSize : imageSize,

  sheetSize,

  croppedSize: {
    width: sheetSize.width - 2 * finalCrop,
    height: sheetSize.height - 2 * finalCrop
  },

  filledExpandedSize: {
    width: sheetSize.width + 10,
    height: sheetSize.height + 10
  },

  uploadSize: {
    width: 512,
    height: 512,
  },

  uploadFile: true,
  uploadUrls: [
    'http://169.254.43.21:3000/image',
  ],

  // calibration is loaded from a single server but may be saved to multiple
  loadCalibrationProfiles: true,
  loadCalibrationUrl: 'http://localhost:3000/calibration',
  saveCalibrationUrls: [
    //'http://169.254.43.21:3000/calibration',
    'http://localhost:3000/calibration',
  ],

  debug: {
    drawSheetCorners: true,
    drawBoundingBox: true,
    drawAllCorners: true,
  },

  // Color mappings and other stuff specific to a certain installation (e.g. pushwagner)
  sceneConfig,
};


export default config;

