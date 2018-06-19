// @flow
export type Size = {|
  height: number,
  width: number,
|}

export type Point = {|
  x: number,
  y: number,
|}

export type Container = {|
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  heading: HTMLElement,
  size: Size,
  gray?: JsFeatImage,
|};

export type SheetParams = {|
  sheetCorners: SheetCorners,
  prerotation: number
|}

export type SheetCorners = {|
  topLeft: Point,
  topRight: Point,
  bottomLeft: Point,
  bottomRight: Point,
|}

export type JsFeatImage = {|
  data: Array<number>, // TODO
  rows: number,
  cols: number
|};

export type Containers = { [string]: Container };

export type SourceElement = HTMLImageElement | HTMLVideoElement;

export type RgbColor = {|
  r: number, g: number, b: number
|}

export type RgbaColor = {|
  r: number, g: number, b: number, a: number
|}

export type NearestColor = {|
  name: string,
  value: string,
  rgb: RgbColor,
  distance: number,
|};

export type NearestColorMapper = (color: RgbColor) => NearestColor;

// a hex rgb color code
export type HexColor = string;

// maps from a key to an rgb color code
export type ColorCodeMap = { [string]: RgbColor }

// key in the map of colors to search for in a photo
export type PhotoColorKey = string;

// maps from a photo color key to a color code
export type PhotoColorCodesMap = { [PhotoColorKey]: HexColor }

// key for a scene ('kings cross', 'manhattan')
export type SceneKey = string;
export type SceneKeys = { [string]: SceneKey }

// BitCode, key for an image ('e.g. the various faceless profiles in the pushwagnesizer')
export type BitCode = number;

export type BitCodeColorMap = {
  black: string,
  dotColor: string,
  white: string,
}
// Maps a bit code to a particular image. Image shape depends on artwork
export type BitCodeToImageMap = { [BitCode]: Object }

// Gives a name to each bit code.
export type ImageBitCodes = { [string]: BitCode }

// maps a photo color to a variation color through the NAME of the color in the photo instead
// of through the value, which makes it possible to change the value when calibration without
// changing anything else.
export type SceneColorCodes = {| [PhotoColorKey]: RgbColor |}

export type SceneColorsMap = {
  // names of all colors to search for in an image
  photo: Array<PhotoColorKey>,

  //TODO: Put this into a scenes element and replace type with ColorsForAllScenes?
  // the mappings from the photo colors to the colors to replace them with for a particular scene.
  // NB: Does not include the default mappings.
  [SceneKey]: SceneColorCodes,
}

// maps from an image bit code key to the color codes for that image in all scene variations
export type ImageToSceneColorsMap = {| [BitCode]: SceneColorsMap |}

// maps from a scene variation key to a map of photo color keys to color codes.
export type SceneToColorCodesMap = {| [SceneKey]: SceneColorCodes |}

export type ColorsForAllScenes = {
  // Colors used in image, these are the colors to look for. Use as few colors as possible to
  // make it less likely that colors are detected wrong.
  photo: Array<PhotoColorKey>,

  // Maps from photo color name to the color code (hex) to use for that color in each scene.
  scenes: SceneToColorCodesMap
}

export type ColorsForAllImages = {
  [BitCode]: ColorsForAllScenes
}

export type SceneConfig = {
  id: string,

  // Identifiers for the various artworks
  scenes: SceneKeys,

  // bit codes - codes that tell us what version of an input sheet we've photographed
  imageBitCodes: ImageBitCodes,
  imageNameGenerator: (variation: string, image: Object, uuid: string) => string,
  bitCodeToImageMap: BitCodeToImageMap,
  bitCodeColorMappings: BitCodeColorMap,
  bitPositionsMM: Array<Point>,

  // mapping of colors, from colors found in a photo to the colors to use for each input scene in
  // each scene,
  defaultColorMappings: SceneToColorCodesMap,
  colorMappings: ImageToSceneColorsMap,
  photoColorCodes: PhotoColorCodesMap, // TODO: Why is this needed? Startup before calibration?

  // positions and sizes related to sheet that is photographed
  sheetSizeMM: Size,
  logoDetectionPositionMM: Point,
  logoBoundingBoxMM: { upperLeft: Point, size: Size },
  calibrationColorPositionsMM: { [string]: Point },
}

export type CalibrationProfile = {
  id: string,
  sceneId: SceneKey,
  time: number,
  name: string,
  colors: PhotoColorCodesMap,
}

export type Logger = {
  info: (*) => void,
  warn: (*) => void,
  error: (*) => void,
}