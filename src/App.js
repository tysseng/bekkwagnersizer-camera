import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import imageToProcess from './assets/images/IMG_6307.jpg';
import { processImage, processBaseline } from './processing/imageProcessor';
import config from './config';
import VideoCapturer from "./video/VideoCapturer";
import logger from './utils/logger';

const setSize = (container, { width, height }) => {
  container.canvas.width = width;
  container.canvas.height = height;
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
    this.processImage = this.processImage.bind(this);
    this.processBaseline = this.processBaseline.bind(this);
    this.captureCanvases = this.captureCanvases.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
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

  processImage(sequenceNumber) {
    //logger.info("Process image", sequenceNumber);

    try {
      processImage(this.state.canvases);
    } catch (error) {
      logger.error('Could not complete image processing');
      logger.error(error);
    }
  }

  processBaseline() {
    logger.info("Process baseline image");

    try {
      processBaseline(this.state.canvases);
    } catch (error) {
      logger.error('Could not set baseline');
      logger.error(error);
    }
  }

  captureCanvases() {
    const all = [
      this.refs.canvas1,
      this.refs.canvas2,
      this.refs.canvas3,
      this.refs.canvas4,
      this.refs.canvas5,
      this.refs.canvas6,
      this.refs.canvas7,
      this.refs.canvas8,
      this.refs.canvas9,
      this.refs.canvas10,
      this.refs.canvas11,
      this.refs.canvas12,
    ];

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
        edges: { canvas: all[curr++] },
        removedElements: { canvas: all[curr++] },
        filled: { canvas: all[curr++] },
        mask: { canvas: all[curr++] },
        extracted: { canvas: all[curr++] },
      };
    } else {

    }

    setSize(canvases.baselineVideoFrame, config.videoFrameSize);
    setSize(canvases.videoFrame, config.videoFrameSize);
    setSize(canvases.detectedSheet, config.videoFrameSize);
    setSize(canvases.detectedSheetRotated, config.videoFrameSize);
    setSize(canvases.correctedSheetRotation, config.videoFrameSize);
    setSize(canvases.correctedSheetScaling, config.sheetSize);
    setSize(canvases.correctedSheetFlipping, config.sheetSize);
    setSize(canvases.edges, config.sheetSize);
    setSize(canvases.removedElements, config.sheetSize);
    setSize(canvases.filled, config.sheetSize);
    setSize(canvases.mask, config.sheetSize);
    setSize(canvases.extracted, config.sheetSize);

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
          <h1 className="App-title">Image processor</h1>
        </header>
        <p className="App-intro">
        </p>
        <div>
          <VideoCapturer
            processImage={this.processImage}
            processBaseline={this.processBaseline}
            canvases={this.state.canvases}
          />
          {/*<span>
            <img id='sourceImage' src={imageToProcess} alt='source'
                 onLoad={() => this.sourceHasLoaded()}/>
          </span>*/}
        </div>
        <div className='canvases'>
          <div>
            <h3>Baseline VideoFrame</h3>
            <canvas ref="canvas1"/>
          </div>
          <div>
            <h3>VideoFrame</h3>
            <canvas ref="canvas2"/>
          </div>
          <div>
            <h3>DetectedSheet</h3>
            <canvas ref="canvas3"/>
          </div>
          <div>
            <h3>DetectedSheet, second try (rotated)</h3>
            <canvas ref="canvas4"/>
          </div>
          <div>
            <h3>Corrected sheet 1 (rotation)</h3>
            <canvas ref="canvas5"/>
          </div>
          <div>
            <h3>CorrectedSheet 2 (scaling)</h3>
            <canvas ref="canvas6"/>
          </div>
          <div>
            <h3>CorrectedSheet 3 (flipping)</h3>
            <canvas ref="canvas7"/>
          </div>
          <div>
            <h3>Edges</h3>
            <canvas ref="canvas8"/>
          </div>
          <div>
            <h3>Removed logo etc</h3>
            <canvas ref="canvas9"/>
          </div>
          <div>
            <h3>Filled</h3>
            <canvas ref="canvas10"/>
          </div>
          <div>
            <h3>Mask (eroded)</h3>
            <canvas ref="canvas11"/>
          </div>
          <div>
            <h3>Extracted</h3>
            <canvas ref="canvas12"/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
