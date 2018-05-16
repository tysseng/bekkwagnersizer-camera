import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { processImage, processBaseline } from './processing/imageProcessor';
import config from './config';
import VideoCapturer from "./video/VideoCapturer";
import logger from './utils/logger';
import ImageCapturer from "./image/ImageCapturer";

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

  processImage() {

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
    const canvasesDiv = document.querySelector('.canvases');
    const all =  canvasesDiv.querySelectorAll('canvas');

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
          <h1 className="App-title">Image processor</h1>
        </header>
        <p className="App-intro">
        </p>
        <div>
          {config.source === 'video' ?
            <VideoCapturer
              dimensions={config.sourceSize}
              processImage={this.processImage}
              processBaseline={this.processBaseline}
              canvases={this.state.canvases}
            />
            :
            <ImageCapturer
              dimensions={config.sourceSize}
              processImage={this.processImage}
              canvases={this.state.canvases}
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
