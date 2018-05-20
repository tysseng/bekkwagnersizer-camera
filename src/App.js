import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { run, runSingleCycle, stop } from './runner';
import config from './config';
import Video from "./sources/Video";
import logger from './utils/logger';
import Image from "./sources/Image";
import { captureBaselineVideoFrame } from "./detection/capturing";
import { processBaseline } from "./processing/processor";
import { captureOriginalCircle } from "./detection/outlineOcclusionDetection";

const setSize = (container, { width, height }) => {
  container.canvas.width = width;
  container.canvas.height = height;
  container.dimensions = { width, height };
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canvases: null,
      sourceImageHasLoaded: false,
      sequenceNumber: 0,
    };
    this.sourceHasLoaded = this.sourceHasLoaded.bind(this);
    this.run = this.run.bind(this);
    this.runSingleCycle = this.runSingleCycle.bind(this);
    this.setBaseline = this.setBaseline.bind(this);
    this.captureCanvases = this.captureCanvases.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getSourceElement = this.getSourceElement.bind(this);
  }

  componentDidMount() {
    this.captureCanvases();
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
      runSingleCycle(this.state.canvases, this.getSourceElement());
    } catch (error) {
      logger.error('Could not complete image processing');
      logger.error(error);
    }
  }

  stop() {
    stop();
  }

  setBaseline() {
    logger.info("Process baseline image");

    try {
      captureBaselineVideoFrame(this.state.canvases, this.getSourceElement());
      captureOriginalCircle(this.state.canvases.baselineVideoFrame.ctx);
    } catch (error) {
      logger.error('Could not set baseline');
      logger.error(error);
    }
  }

  captureCanvases() {
    const canvasesDiv = document.querySelector('.canvases');
    const all = canvasesDiv.querySelectorAll('canvas');

    let curr = 0;
    let canvases;
    if (config.showSteps) {
      canvases = {
        baselineVideoFrame: { canvas: all[curr++] },
        videoFrame: { canvas: all[curr++] },
        detectedSheet: { canvas: all[curr++] },
        detectedSheetRotated: { canvas: all[curr++] },
        correctedSheetRotation: { canvas: all[curr++] },
        correctedSheetScaling: { canvas: all[curr++] },
        correctedSheetFlipping: { canvas: all[curr++] },
        bitCodeDetection: { canvas: all[curr++] },
        edges: { canvas: all[curr++] },
        removedElements: { canvas: all[curr++] },
        filled: { canvas: all[curr++] },
        mask: { canvas: all[curr++] },
        extracted: { canvas: all[curr++] },
        uploadable: { canvas: all[curr++] },
      };
    } else {

    }

    const sourceSize = config.sourceSize;
    const sheetSize = config.sheetSize;
    const uploadSize = config.uploadSize;

    setSize(canvases.baselineVideoFrame, sourceSize);
    setSize(canvases.videoFrame, sourceSize);
    setSize(canvases.detectedSheet, sourceSize);
    setSize(canvases.detectedSheetRotated, sourceSize);
    setSize(canvases.correctedSheetRotation, sourceSize);
    setSize(canvases.correctedSheetScaling, sheetSize);
    setSize(canvases.correctedSheetFlipping, sheetSize);
    setSize(canvases.bitCodeDetection, sheetSize);
    setSize(canvases.edges, sheetSize);
    setSize(canvases.removedElements, sheetSize);
    setSize(canvases.filled, sheetSize);
    setSize(canvases.mask, sheetSize);
    setSize(canvases.extracted, sheetSize);
    setSize(canvases.uploadable, uploadSize);

    Object.keys(canvases).forEach(key => {
      canvases[key].ctx = canvases[key].canvas.getContext('2d');
    });

    this.setState({ canvases });
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
          <button onClick={() => this.runSingleCycle()}>Run single</button>
          <button className='primary'onClick={() => this.run()}>Run forever</button>
          <button onClick={() => this.stop()}>Stop!</button>
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
            <h3>Baseline VideoFrame</h3>
            <canvas/>
          </div>
          <div>
            <h3>VideoFrame</h3>
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
            <canvas/>
          </div>
          <div>
            <h3>CorrectedSheet 3 (flipping)</h3>
            <canvas/>
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
            <h3>Filled</h3>
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
            <h3>Uploadable</h3>
            <canvas/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
