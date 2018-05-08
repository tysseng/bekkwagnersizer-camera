// @flow
import React from 'react';

class CanvasComponent extends React.Component {

  componentWillReceiveProps(nextProps){

    const { imageLoaded, width, height, sequenceNumber } = nextProps;

    if(sequenceNumber !== this.props.sequenceNumber && sequenceNumber > 0){
      console.log("ANALYZE THIS");
      const canvas = this.refs.canvas;
      const targetCtx = this.refs.targetCanvas.getContext('2d');
      const targetCtx2 = this.refs.targetCanvas2.getContext('2d');
      this.props.processor(canvas, targetCtx, targetCtx2, width, height)
    }
  }

  render() {
    const {width, height} = this.props;
    return (
      <div>
        <canvas ref="canvas" width={width} height={height}/>
        <canvas ref="targetCanvas" width={width} height={height}/>
        <canvas ref="targetCanvas2" width={width} height={height}/>
      </div>
    );
  }
}

export default CanvasComponent;