// @flow
import React from 'react';

class VideoComponent extends React.Component {

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
    this.captureVideo = this.captureVideo.bind(this);
  }

  videoStreamLoaded(stream) {
    window.stream = stream; // make stream available to browser console
    this.videoElement.srcObject = stream;
  }

  videoStreamLoadFailed(error) {
    console.log('Error loading video stream', error);
  }

  componentDidMount() {
    const { width, height } = this.props;
    this.videoElement = this.refs.video;
    this.videoCanvas = this.refs.videoCanvas;
    const constraints = {
      audio: false,
      video: true
    };

    navigator.getUserMedia(constraints, this.videoStreamLoaded, this.videoStreamLoadFailed);
  }

  captureVideo() {
    const { width, height } = this.props;
    const ctx = this.videoCanvas.getContext('2d');

    // rotate canvas before drawing as other algorithms are based on a vertical image
    ctx.translate(width / 2, height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-height / 2, -width / 2);
    ctx.drawImage(this.videoElement, 0, 0, height, width);

    let sequenceNumber = this.state.sequenceNumber;
    this.props.processImage(sequenceNumber);
    this.setState({sequenceNumber: sequenceNumber + 1});
  }

  render() {
    const { width, height } = this.props;


    return (
      <div>
        <video ref="video"  width={height} autoPlay></video>
        <canvas ref="videoCanvas" width={width} height={height}></canvas>
        <button onClick={() => this.captureVideo()}>Take snapshot</button>
      </div>
    );
  }
}

export default VideoComponent;