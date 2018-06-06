// @flow
export type Dimensions = {
  height: number,
  width: number,
}

export type Point = {
  x: number,
  y: number,
}

export type Container = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  heading: HTMLElement,
  dimensions: Dimensions,
};

export type SheetParams = {
  sheetCorners: SheetCorners,
  prerotation: number
}

export type SheetCorners = {
  topLeft: Point,
  topRight: Point,
  bottomLeft: Point,
  bottomRight: Point,
}

export type JsfeatImage = {
  data: Array<number> // TODO
};

export type Containers = {[string]: Container};

export type SourceElement = HTMLImageElement | HTMLVideoElement;