import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CanvasComponent from "./Canvas";
import imageToProcess from './assets/images/image.jpg';
import processImage from './processing/imageProcessor';

const width=600;
const height=800;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sourceImageHasLoaded: false,
    };
    this.sourceHasLoaded = this.sourceHasLoaded.bind(this);
  }


  sourceHasLoaded(){
    console.log('image has loaded');
    this.setState({
      sourceImageHasLoaded: true
    })
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
          <span>
            <img id='sourceImage' src={imageToProcess} alt='source' onLoad={() => this.sourceHasLoaded()}/>
          </span>
          <span><CanvasComponent width={width} height={height} processor={processImage} imageLoaded={this.state.sourceImageHasLoaded}/></span>
        </div>
      </div>
    );
  }
}

export default App;
