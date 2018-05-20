// @flow
import React from 'react';
import imageToProcess from '../assets/images/IMG_6304.jpg';

class Image extends React.Component {

  render() {
    return (
      <div>
        <img ref='image' src={imageToProcess} alt="There's no alternative!"/>
      </div>
    );
  }
}

export default Image;