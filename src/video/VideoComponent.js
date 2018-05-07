// @flow
import React from 'react';

class VideoComponent extends React.Component {

  videoElement;
  videoCanvas;

  componentDidMount() {
    this.videoElement = document.querySelector('video');
    this.videoCanvas = document.querySelector('canvas');
    this.videoCanvas.width = 480;
    this.videoCanvas.height = 360;

    const constraints = {
      audio: false,
      video: true
    };

    function handleSuccess(stream) {
      window.stream = stream; // make stream available to browser console
      this.video.srcObject = stream;
    }

    function handleError(error) {
      console.log('navigator.getUserMedia error: ', error);
    }

    navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);
  }

  captureVideo() {
    this.videoCanvas.width = this.videoElement.videoWidth;
    this.videoCanvas.height = this.videoElement.videoHeight;
    this.videoCanvas.getContext('2d').
    drawImage(this.videoElement, 0, 0, this.videoCanvas.width, this.videoCanvas.height);
  }

  render() {
    const {width, height} = this.props;


    return (
      <div>
        <video autoPlay></video>
        <button onClick={() => this.captureVideo() }>Take snapshot</button>
        <canvas></canvas>
      </div>
    );
  }
}

export default VideoComponent;