// @flow
import React from 'react';
import config from '../config';
import imageToProcess from '../assets/images/IMG_6307.jpg';

class ImageCapturer extends React.Component {

  constructor(props) {
    super(props);
    this.captureFrame = this.captureFrame.bind(this);
  }

  captureToCanvas(ctx) {
    const img = this.refs.sourceImage;
    const { width, height } = this.props.dimensions;
    ctx.drawImage(img, 0, 0, width, height); // target
  }

  captureFrame() {
    const ctx = this.props.canvases.videoFrame.ctx;
    this.captureToCanvas(ctx);
    this.props.processImage();
  }

  render() {
    return (
      <div>
        <button onClick={() => this.captureFrame()}>Capture!</button>
        <img ref='sourceImage' src={imageToProcess}/>
      </div>
    );
  }
}

export default ImageCapturer;