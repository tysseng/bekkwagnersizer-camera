// @flow
export type Dimensions = {|
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
  dimensions: Dimensions,
  gray?: JsfeatImage,
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

export type JsfeatImage = {|
  data: Array<number> // TODO
|};

export type Containers = {[string]: Container};

export type SourceElement = HTMLImageElement | HTMLVideoElement;

export type RgbColor = {|
  r: number, g: number, b: number
|}

export type NearestColor = {|
  name: string,
  value: string,
  rgb: RgbColor,
  distance: number,
|};

export type NearestColorMapper = (color: RgbColor) => NearestColor;

// a hex rgb color code
export type ColorCode = string;

// maps from a key to a hex rgb color code
export type ColorCodeMap = {[string]: ColorCode}

// key in the map of colors to search for in a photo
export type PhotoColorKey = string;

// maps from a photo color key to a color code
export type PhotoColorCodesMap = {[PhotoColorKey]: ColorCode}

// key for a scene ('kings cross', 'manhattan')
export type SceneKey = string;
export type SceneKeys = {[string]: SceneKey}

// BitCode, key for an image ('e.g. the various faceless profiles in the pushwagnesizer')
export type BitCode = number;

export type BitCodeColorMap = {
  black: string,
  dotColor: string,
  white: string,
}
// Maps a bit code to a particular image. Image shape depends on artwork
export type BitCodeToImageMap = {[BitCode]: Object}

// Gives a name to each bit code.
export type ImageBitCodes = {[string]: BitCode}

// maps from a variation key to a map of photo color keys to color codes.
export type SceneToColorCodesMap = {
  [SceneKey]: {

    // maps a photo color to a variation color through the NAME of the color in the photo instead
    // of through the value, which makes it possible to change the value when calibration without
    // changing anything else.
    [PhotoColorKey]: ColorCode;
  }
}

// maps from an image key to the color codes for that image in all scene variations
export type ImageToSceneColorsMap = {|
  [BitCode]: {|
    // colors found in this particular image
    photo: Array<PhotoColorKey>,

    // the mappings from those colors to a per-variation color.
    [SceneKey]: {|
      [photoColorKey: PhotoColorKey]: ColorCode;
    |}
  |}
|}

export type SceneConfig = {
  scenes: SceneKeys,
  imageBitCodes: ImageBitCodes,
  bitCodeToImageMap: BitCodeToImageMap,
  defaultColorMappings: SceneToColorCodesMap,
  colorMappings: ImageToSceneColorsMap,
  photoColorCodes: PhotoColorCodesMap, // TODO: Why is this needed? Startup before calibration?
  bitCodeColorMappings: BitCodeColorMap,
}