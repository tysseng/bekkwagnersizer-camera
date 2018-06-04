import React, { Component } from 'react';
import keydown from 'react-keydown';
import logo from './logo.svg';
import './App.css';
import {
  run, runOnce, setUploadAfterCapture, stop, init as initRunner,
  calibrateColors
} from './runner';
import config from './config';
import Video from "./sources/Video";
import logger from './utils/logger';
import Image from "./sources/Image";
import { captureBaselineVideoFrame, captureWhitePixelsVideoFrame } from "./detection/capturing";
import { captureOriginalCircle } from "./detection/outlineOcclusionDetection";
import { captureOriginalSheetPresenceLine } from "./detection/sheetPresence";
import { uploadFile } from "./communication/fileUploader";
import { extractAndResizeCanvases } from "./canvases";

const App = keydown(class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canvases: null,
      sourceImageHasLoaded: false,
      sequenceNumber: 0,
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
    this.testUpload = this.testUpload.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { keydown: { event } } = nextProps;
    if (event) {
      logger.info('KEY', event.which);
      if (event.which === 190) {
        this.runSingleCycle();
      }
    }
  }

  componentDidMount() {
    const canvases = this.captureCanvases();
    initRunner(canvases);
  }

  sourceHasLoaded() {
    logger.info('image has loaded');
    this.setState({
      sourceImageHasLoaded: true
    })
  }

  getSourceElement() {
    if (config.source === 'video') {
      return this.refs.videoSource.refs.video;
    } else {
      return this.refs.imageSource.refs.image;
    }
  }

  handleUploadAfterCaptureChange(event) {
    const target = event.target;
    const value = target.checked;
    logger.info('Toggled upload after capture to ' + value);
    this.setState({
      uploadAfterCapture: value,
    });
    setUploadAfterCapture(value);
  }

  run() {
    try {
      run(this.state.canvases, this.getSourceElement());
    } catch (error) {
      logger.error('Could not complete image processing');
      logger.error(error);
    }
  }

  runSingleCycle() {
    try {
      runOnce(this.state.canvases, this.getSourceElement());
    } catch (error) {
      logger.error('Could not complete image processing');
      logger.error(error);
    }
  }

  runColorCalibration() {
    try {
      calibrateColors(this.state.canvases, this.getSourceElement());
    } catch (error) {
      logger.error('Could not complete color calibration');
      logger.error(error);
    }
  }

  stop() {
    stop();
  }

  testUpload() {
    uploadFile(this.state.canvases.uploadable1.canvas, 1, 2);
  }

  setBaseline() {
    logger.info("Process baseline image");

    try {
      captureBaselineVideoFrame(this.state.canvases, this.getSourceElement());
      captureOriginalCircle(this.state.canvases);
      captureOriginalSheetPresenceLine(this.state.canvases);
    } catch (error) {
      logger.error('Could not set baseline');
      logger.error(error);
    }
  }

  setWhitePixels() {
    try {
      captureWhitePixelsVideoFrame(this.state.canvases, this.getSourceElement());
    } catch (error) {
      logger.error('Could not set white pixels');
      logger.error(error);
    }
  }

  captureCanvases() {
    const canvasesDiv = document.querySelector('.canvases');
    const all = canvasesDiv.querySelectorAll('canvas');
    const canvases = extractAndResizeCanvases(all);
    this.setState({ canvases });
    return canvases;
  }

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
          <button className='initial' onClick={() => this.setBaseline()}>Set initial</button>
          <button className='initial' onClick={() => this.setWhitePixels()}>Set white pixels</button>
          <button className='initial' onClick={() => this.runColorCalibration()}>Calibrate colors
          </button>
          <button className='initial' onClick={() => this.testUpload()}>Test upload!</button>
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
          {config.source === 'video' ?
            <Video
              dimensions={config.sourceSize}
              canvases={this.state.canvases}
              ref='videoSource'
            />
            :
            <Image
              dimensions={config.sourceSize}
              canvases={this.state.canvases}
              ref='imageSource'
            />
          }
        </div>
        <div className='canvases'>
          <div>
            <h2>Pre-capture frames</h2>
            <div>
              <h3>Calibrated input colors</h3>
              <canvas/>
            </div>
            <div>
              <h3>Baseline VideoFrame</h3>
              <canvas/>
            </div>
            <div>
              <h3>White VideoFrame</h3>
              <canvas/>
            </div>
          </div>
          <div>
            <h3>VideoFrame</h3>
            <canvas/>
          </div>
          <div>
            <h3>White-corrected video frame</h3>
            <canvas/>
          </div>
          <div>
            <h3>DetectedSheet</h3>
            <canvas/>
          </div>
          <div>
            <h3>DetectedSheet, second try (rotated)</h3>
            <canvas/>
          </div>
          <div>
            <h3>Corrected sheet 1 (rotation)</h3>
            <canvas/>
          </div>
          <div>
            <h3>CorrectedSheet 2 (scaling)</h3>
            <canvas id='correctedScale'/>
          </div>
          <div>
            <h3>CorrectedSheet 3 (flipping)</h3>
            <canvas id='correctedFlip'/>
          </div>
          <div>
            <h3>Bit code detection</h3>
            <canvas/>
          </div>
          <div>
            <h3>Edges</h3>
            <canvas/>
          </div>
          <div>
            <h3>Removed logo etc</h3>
            <canvas/>
          </div>
          <div>
            <h3>Filled, with border</h3>
            <canvas/>
          </div>
          <div>
            <h3>Filled, with border removed</h3>
            <canvas/>
          </div>
          <div>
            <h3>Mask (eroded)</h3>
            <canvas/>
          </div>
          <div>
            <h3>Extracted</h3>
            <canvas/>
          </div>
          <div>
            <h3>Cropped to prevent edges</h3>
            <canvas/>
          </div>
          <div>
            <h2>Colored</h2>
            <div>
              <h3>People</h3>
              <canvas/>
            </div>
            <div>
              <h3>Manhattan</h3>
              <canvas/>
            </div>
            <div>
              <h3>Kings Cross 1</h3>
              <canvas/>
            </div>
            <div>
              <h3>Kings Cross 2</h3>
              <canvas/>
            </div>
            <br/>
          </div>
          <div>
            <h3>Uploadable</h3>
            <canvas/>
            <canvas/>
            <canvas/>
            <canvas/>
          </div>
        </div>
      </div>
    );
  }
});

export default App;
