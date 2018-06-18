// @flow
import React, { Component } from 'react';
import keydown from 'react-keydown';
import logo from './logo.svg';
import './App.css';
import {
  init as initRunner,
  run as runIndefinitely,
  stop as stopRunning,
  runOnce,
  setUploadAfterCapture,
  calibrateColors
} from './runner';
import config from './config';
import Video from "./sources/Video";
import logger from './utils/logger';
import Image from "./sources/Image";
import { captureBaselineVideoFrame, captureWhitePixelsVideoFrame } from "./detection/capturing";
import { captureOriginalCircle } from "./detection/occlusionDetection";
import { captureOriginalSheetPresenceLine } from "./detection/sheetPresence";
import { extractAndResizeCanvases } from "./canvases";
import type { Containers, SourceElement } from "./types";
import CalibrationProfiles from "./CalibrationProfiles";

type AppState = {
  canvases: Containers,
  sourceImageHasLoaded: boolean,
  uploadAfterCapture: boolean,
};

type Props = {
  keydown: {
    event: {
      which: number,
    }
  }
};

const App = keydown(class App extends Component<Props, AppState> {

  constructor(props: *) {
    super(props);
    this.state = {
      canvases: {},
      sourceImageHasLoaded: false,
      uploadAfterCapture: config.defaultUploadAfterCapture,
    };
    this.sourceHasLoaded = this.sourceHasLoaded.bind(this);
    this.run = this.run.bind(this);
    this.runSingleCycle = this.runSingleCycle.bind(this);
    this.runColorCalibration = this.runColorCalibration.bind(this);
    this.setBaseline = this.setBaseline.bind(this);
    this.setWhitePixels = this.setWhitePixels.bind(this);
    this.captureCanvases = this.captureCanvases.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.getSourceElement = this.getSourceElement.bind(this);
    this.handleUploadAfterCaptureChange = this.handleUploadAfterCaptureChange.bind(this);
  }

  componentWillReceiveProps = function(nextProps: Props) {
    const { keydown: { event } } = nextProps;
    if (event) {
      logger.info('KEY', event.which);
      if (event.which === 190) {
        this.runSingleCycle();
      }
    }
  };

  componentDidMount = function() {
    const canvases = this.captureCanvases();
    initRunner(canvases);
  };

  sourceHasLoaded = function() {
    logger.info('image has loaded');
    this.setState({
      sourceImageHasLoaded: true
    })
  };

  getSourceElement = function(): SourceElement {
    if (config.source === 'video') {
      return this.refs.videoSource.refs.video;
    } else {
      return this.refs.imageSource.refs.image;
    }
  };

  handleUploadAfterCaptureChange = function(event: Event) {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      const value = target.checked;
      if(value){
        logger.info('Turned on upload');
      } else {
        logger.info('Turned off upload');
      }
      this.setState({
        uploadAfterCapture: value,
      });
      setUploadAfterCapture(value);
    }
  };

  run = function() {
    try {
      runIndefinitely(this.getSourceElement(), this.state.canvases);
    } catch (error) {
      logger.error('Could not complete image processing');
      logger.error(error);
    }
  };

  runSingleCycle = function() {
    try {
      runOnce(this.getSourceElement(), this.state.canvases);
    } catch (error) {
      logger.error('Could not complete image processing');
      logger.error(error);
    }
  };

  runColorCalibration = function() {
    try {
      calibrateColors(this.getSourceElement(), this.state.canvases);
    } catch (error) {
      logger.error('Could not complete color calibration');
      logger.error(error);
    }
  };

  stop = function() {
    stopRunning();
  };

  setBaseline = function() {
    logger.info("Process baseline image");

    try {
      captureBaselineVideoFrame(this.getSourceElement(), this.state.canvases.baselineVideoFrame);
      captureOriginalCircle(this.state.canvases.baselineVideoFrame);
      captureOriginalSheetPresenceLine(this.state.canvases.baselineVideoFrame);
    } catch (error) {
      logger.error('Could not set baseline');
      logger.error(error);
    }
  };

  setWhitePixels = function() {
    try {
      captureWhitePixelsVideoFrame(this.getSourceElement(), this.state.canvases.whitePixelsVideoFrame);
    } catch (error) {
      logger.error('Could not set white pixels');
      logger.error(error);
    }
  };

  captureCanvases = function(): Containers {

    const canvasesDiv = document.querySelector('.canvases');
    if(canvasesDiv === null){
      throw Error('Could not find any canvases')
    }
    const all = canvasesDiv.querySelectorAll('.canvas');
    const canvases = extractAndResizeCanvases(
      all,
      document.querySelector('.processingCanvases'),
      document.querySelector('.coloredCanvases'),
      document.querySelector('.uploadableCanvases'),
    );
    this.setState({ canvases });
    return canvases;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h1 className="App-title">ED Awards Image processor - Joakim Tysseng 2018</h1>
        </header>
        <p className="App-intro">
        </p>
        <div>
          <button onClick={() => this.runSingleCycle()}>Run single</button>
          <button className='primary' onClick={() => this.run()}>Run forever</button>
          <button className='initial' onClick={() => this.stop()}>Stop!</button>
          <label>
            <input
              type='checkbox'
              checked={this.state.uploadAfterCapture}
              onChange={this.handleUploadAfterCaptureChange}/>
            Upload image after capture
          </label>
        </div>
        <div>
          <button className='initial' onClick={() => this.setBaseline()}>Set initial</button>
          <button className='initial' onClick={() => this.setWhitePixels()}>Set white pixels
          </button>
          <button className='initial' onClick={() => this.runColorCalibration()}>Calibrate colors
          </button>
          <CalibrationProfiles/>
        </div>
        <div>
          {config.source === 'video' ?
            <Video
              canvases={this.state.canvases}
              ref='videoSource'
            />
            :
            <Image
              canvases={this.state.canvases}
              ref='imageSource'
            />
          }
        </div>
        <div className='canvases'>
          <div className='preCaptureCanvases'>
            <h2>Pre-capture frames</h2>
            <div className='canvas'>
              <h3>Calibrated input colors</h3>
              <canvas/>
            </div>
            <div className='canvas'>
              <h3>Baseline VideoFrame</h3>
              <canvas/>
            </div>
            <div className='canvas'>
              <h3>White VideoFrame</h3>
              <canvas/>
            </div>
            <div className='canvas'>
              <h3>VideoFrame</h3>
              <canvas/>
            </div>
          </div>
          <div className='processingCanvases'>
            <h2>Processing</h2>

          </div>
          <div className='coloredCanvases'>
            <h2>Colored</h2>

          </div>
          <div className='uploadableCanvases'>
            <h2>Uploadable</h2>

          </div>
        </div>
      </div>
    );
  }
});

export default App;
