// @flow
import React from 'react';
import config from '../config';
import logger from '../utils/logger';

class Video extends React.Component<*> {

  videoElement: HTMLVideoElement;

  constructor(props: *) {
    super(props);
    this.videoStreamLoaded = this.videoStreamLoaded.bind(this);
    this.videoStreamLoadFailed = this.videoStreamLoadFailed.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  videoStreamLoaded = function(stream: *) {
    window.stream = stream; // make stream available to browser console
    this.videoElement.srcObject = stream;
  };

  videoStreamLoadFailed = function(error: Error) {
    logger.error('Error loading video stream', error);
  };

  componentDidMount = function() {
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

    if(navigator){
      // For some reason, we get a flow error here.
      // $FlowFixMe
      navigator.getUserMedia(constraints, this.videoStreamLoaded, this.videoStreamLoadFailed);
    } else {
      logger.error('Could not get user media from navigator');
    }
  };

  render() {
    const { videoSize } = config;
    return (
      <div>
        <video ref="video" width={videoSize.width} autoPlay/>
      </div>
    );
  }
}

export default Video;