// @flow
import React from 'react';
import config from '../config';
import logger from '../utils/logger';

const { videoSize, videoDrawingAreaSize } = config;
const videoOffsetX = (videoSize.width - videoDrawingAreaSize.width) / 2;
const videoOffsetY = (videoSize.height - videoDrawingAreaSize.height) / 2;

class VideoCapturer extends React.Component {

  videoElement;
  videoCanvas;

  constructor(props) {
    super(props);
    this.state = {
      sequenceNumber: 1,
    };
    this.videoCanvas = props.canvas;
    this.videoStreamLoaded = this.videoStreamLoaded.bind(this);
    this.videoStreamLoadFailed = this.videoStreamLoadFailed.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.captureVideoFrame = this.captureVideoFrame.bind(this);
    this.getSequenceNumber = this.getSequenceNumber.bind(this);
  }

  videoStreamLoaded(stream) {
    window.stream = stream; // make stream available to browser console
    this.videoElement.srcObject = stream;
  }

  videoStreamLoadFailed(error) {
    logger.error('Error loading video stream', error);
  }

  componentDidMount() {
    this.videoElement = this.refs.video;
    this.videoCanvas = this.refs.videoCanvas;
    const constraints = {
      audio: false,
      video: true
    };

    navigator.getUserMedia(constraints, this.videoStreamLoaded, this.videoStreamLoadFailed);
  }

  getSequenceNumber() {
    const sequenceNumber = this.state.sequenceNumber;
    this.setState({ sequenceNumber: sequenceNumber + 1 });
    return sequenceNumber;
  }

  captureVideoFrame() {
    const { canvasDrawingAreaSize } = config;
    const ctx = this.videoCanvas.getContext('2d');

    // capture, crop and scale video, making sure we only get the part of the video frame that
    // contains our circular drawing area.
    ctx.drawImage(this.videoElement,
      videoOffsetX, videoOffsetY,
      videoDrawingAreaSize.width, videoDrawingAreaSize.height,
      0, 0, canvasDrawingAreaSize.width, canvasDrawingAreaSize.height);

    // tell the world that a new image is ready.
    this.props.processImage(this.getSequenceNumber());
  }

  render() {
    const { videoSize, canvasDrawingAreaSize } = config;
    return (
      <div>
        <button onClick={() => this.captureVideoFrame()}>Capture!</button>
        <video ref="video" width={videoSize.width} autoPlay/>
        <canvas ref="videoCanvas"
                width={canvasDrawingAreaSize.width}
                height={canvasDrawingAreaSize.width}/>
      </div>
    );
  }
}

export default VideoCapturer;