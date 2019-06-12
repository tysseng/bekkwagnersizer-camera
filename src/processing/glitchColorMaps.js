import { imageCodes } from './imageCodes';
import variations from './sceneVariations';
import { color } from './colorMapping';

// all colors found in photos. Will be changed by calibration!
export const photoColors = {
  white: '#eeeeee',
  black: '#4C5556',
  blue: '#039cd5',
  green: '#00ef07',
  purple: '#db69ff',
};

// All colors to use for replacing.
const screenColorsGlitch = {
  white: color('#ffffff', 0),
  black: color('#000000'),
  blue: color('#0c9ee7'),
  green: color('#00ff02'),
  purple: color('#f104f5'),
};

// Default mappings to use for the variations, if no other mapping is found.

export const getDefaultMappings = () => {
  const defaultMappings = [];
  defaultMappings[variations.glitch] = {
    [photoColors.black]: screenColorsGlitch.black,
    [photoColors.white]: screenColorsGlitch.white,
    [photoColors.blue]: screenColorsGlitch.blue,
    [photoColors.purple]: screenColorsGlitch.purple,
    [photoColors.green]: screenColorsGlitch.green,
  };
  return defaultMappings;
};

// mappings between photo colors and variations for each image. Comes in addition to default colors.
// NB: photo colors must include ALL colors we expect to find in image, including black and white.
// TODO: Make black, white and skin color default?
export const getMappings = () => ({
  [imageCodes.default]: {
    // Colors we expect to find
    photo: [
      photoColors.white,
      photoColors.blue,
      photoColors.purple,
      photoColors.green,
    ],

    // Color mappings
    [variations.glitch]: {
      [photoColors.blue]: screenColorsGlitch.blue,
      [photoColors.green]: screenColorsGlitch.green,
      [photoColors.purple]: screenColorsGlitch.purple,
    },
  },
});