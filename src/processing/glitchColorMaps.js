import { imageCodes } from './imageCodes';
import variations from './sceneVariations';
import { color } from './colorMapping';

// all colors found in photos. Will be changed by calibration!
export const photoColors = {
  white: '#eeeeee',
  black: '#4C5556',
  blue: '#4C5556',
  red: '#F4FEFF',
  yellow: '#7CD8EF',
  pink: '#FFB254',
  green: '#8BD19F',
};

// All colors to use for replacing.
const screenColorsGlitch = {
  white: color('#ffffff', 0),
  black: color('#000000'),
  blue: color('#00e7e2'),
  red: color('#c92128'),
  yellow: color('#f8fc08'),
  pink: color('#f104f5'),
  green: color('#00ff02'),
};

// Default mappings to use for the variations, if no other mapping is found.

export const getDefaultMappings = () => {
  const defaultMappings = [];
  defaultMappings[variations.glitch] = {
    [photoColors.black]: screenColorsGlitch.black,
    [photoColors.white]: screenColorsGlitch.white,
    [photoColors.blue]: screenColorsGlitch.blue,
    [photoColors.red]: screenColorsGlitch.red,
    [photoColors.yellow]: screenColorsGlitch.yellow,
    [photoColors.pink]: screenColorsGlitch.pink,
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
      photoColors.red,
      photoColors.yellow,
      photoColors.pink,
      photoColors.green,
    ],

    // Color mappings
    [variations.glitch]: {
      [photoColors.blue]: screenColorsGlitch.blue,
      //[photoColors.red]: screenColorsGlitch.red,
      [photoColors.yellow]: screenColorsGlitch.yellow,
      [photoColors.pink]: screenColorsGlitch.pink,
      [photoColors.green]: screenColorsGlitch.green,
    },
  },
});