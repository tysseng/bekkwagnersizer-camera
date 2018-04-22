// @flow
import React from 'react';

class CanvasComponent extends React.Component {

  componentWillReceiveProps(nextProps){

    const { imageLoaded, width, height } = nextProps;

    if(this.props.imageLoaded !== imageLoaded && imageLoaded===true){
      const ctx = this.refs.canvas.getContext('2d');
      this.props.processor(ctx, width, height)
    }
  }

  render() {
    const {width, height} = this.props;
    return (
      <canvas id='sourceCanvas' ref="canvas" width={width} height={height}/>
    );
  }
}

export default CanvasComponent;