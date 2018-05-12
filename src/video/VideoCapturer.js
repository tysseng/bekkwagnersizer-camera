// @flow
import React from 'react';
import config from '../config';
import logger from '../utils/logger';
import { drawCircle } from "../processing/draw";

const { videoCircle } = config;
const videoOffsetX = videoCircle.x - videoCircle.radius;
const videoOffsetY = videoCircle.y - videoCircle.radius;


class VideoCapturer extends React.Component {

  videoElement;

  constructor(props) {
    super(props);
    this.videoStreamLoaded = this.videoStreamLoaded.bind(this);
    this.videoStreamLoadFailed = this.videoStreamLoadFailed.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.captureVideoFrame = this.captureVideoFrame.bind(this);
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
    const constraints = {
      audio: false,
      video: {
        width: {
          min: 1280,
          ideal: 3840,
          max: 3840
        },
        height: {
          min: 720,
          ideal: 2160,
          max: 2160
        }
      }
    };

    navigator.getUserMedia(constraints, this.videoStreamLoaded, this.videoStreamLoadFailed);
  }

  captureToCanvas(ctx) {
    const { width, height } = this.props.dimensions;

    // capture, crop and scale video, making sure we only get the part of the video frame that
    // contains our circular drawing area.
    ctx.drawImage(this.videoElement,
      videoOffsetX, videoOffsetY, videoCircle.radius, videoCircle.radius, // source
      0, 0, width, height); // target

    // Draw crop circle
    drawCircle(ctx, { x: width / 2, y: width / 2, radius: width / 2 });
  }

  captureBaselineVideoFrame() {
    const ctx = this.props.canvases.baselineVideoFrame.ctx;
    this.captureToCanvas(ctx);
    this.props.processBaseline();
  }

  captureVideoFrame() {
    const ctx = this.props.canvases.videoFrame.ctx;
    this.captureToCanvas(ctx);
    this.props.processImage();
    //setTimeout(() => this.captureVideoFrame(), 100);
  }

  render() {
    const { videoSize } = config;
    return (
      <div>
        <button onClick={() => this.captureBaselineVideoFrame()}>Set initial</button>
        <button onClick={() => this.captureVideoFrame()}>Capture!</button>
        <video ref="video" width={videoSize.width} autoPlay/>
      </div>
    );
  }
}

export default VideoCapturer;