// @flow
import React from 'react';

class VideoComponent extends React.Component {

  videoElement;
  videoCanvas;

  constructor(props){
    super(props);
    this.videoCanvas = props.canvas;
    this.videoStreamLoaded = this.videoStreamLoaded.bind(this);
    this.videoStreamLoadFailed = this.videoStreamLoadFailed.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  videoStreamLoaded(stream){
    window.stream = stream; // make stream available to browser console
    this.videoElement.srcObject = stream;
  }

  videoStreamLoadFailed(error){
    console.log('Error loading video stream', error);
  }

  componentDidMount() {
    const {width, height} = this.props;
    this.videoElement = this.refs.video;
    this.videoCanvas = this.refs.videoCanvas;
    const constraints = {
      audio: false,
      video: true
    };

    navigator.getUserMedia(constraints, this.videoStreamLoaded, this.videoStreamLoadFailed);
  }

  captureVideo() {
    this.videoCanvas
      .getContext('2d')
      .drawImage(this.videoElement, 0, 0, this.videoCanvas.width, this.videoCanvas.height);
    this.props.processImage();
  }

  render() {
    const {width, height} = this.props;


    return (
      <div>
        <video ref="video" autoPlay></video>
        <canvas ref="videoCanvas" width={width} height={height}></canvas>
        <button onClick={() => this.captureVideo()}>Take snapshot</button>
      </div>
    );
  }
}

export default VideoComponent;