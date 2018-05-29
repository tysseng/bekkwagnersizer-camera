import imageCodes from './imageCodes';
import variations from './sceneVariations';
import { color } from './colorMapping';

// all colors found in photos
const photoColors = {
  black: '#4C4C4C',
  white: '#D9D4D8',
  lightBlue: '#64C5D5',
  orange: '#D55800',
  green: '#86C17F',
  skin: '#EFBFCE',
  yellow: '#f1eb00',
  wine: '#CD0031',
  purple: '#D40FAB',
  darkBlue: '#557CD7',
};

// All colors to use for replacing.
const screenColorsPeople = {
  black: color('#000000'),
  white: color('#ffffff'),
  darkBlue: color('#483995'),
  blue: color('#4272b8'),
  mint: color('#8ecb8b'),
  red: color('#c92128'),
  orange: color('#fcbf20'),
  tan: color('#fabfba'),
  yellow: color('#f5eb0d'),
  lightYellow: color('#f8f3a0'),
  skin: color('#f0d8e9'),
};

// Default mappings to use for the variations, if no other mapping is found.
export const defaultMappings = [];
defaultMappings[variations.people] = {
  [photoColors.black]: screenColors.black,
  [photoColors.white]: screenColors.white,
  [photoColors.lightBlue]: screenColors.lightBlue,
  [photoColors.orange]: screenColors.orange,
  [photoColors.mint]: screenColors.mint,
  [photoColors.skin]: screenColors.skin,
  [photoColors.yellow]: screenColors.yellow,
};
defaultMappings[variations.manhattan] = {
  [photoColors.black]: screenColors.black,
  [photoColors.white]: screenColors.white,
  [photoColors.lightBlue]: screenColors.lightBlue,
  [photoColors.orange]: screenColors.orange,
  [photoColors.mint]: screenColors.mint,
  [photoColors.skin]: screenColors.skin,
  [photoColors.yellow]: screenColors.yellow,
};
defaultMappings[variations.telly] = {
  [photoColors.black]: screenColors.black,
  [photoColors.white]: screenColors.white,
  [photoColors.lightBlue]: screenColors.lightBlue,
  [photoColors.orange]: screenColors.orange,
  [photoColors.mint]: screenColors.mint,
  [photoColors.skin]: screenColors.skin,
  [photoColors.yellow]: screenColors.yellow,
};

defaultMappings[variations.kingscross] = {
  [photoColors.black]: screenColors.black,
  [photoColors.white]: screenColors.lightBlue,
  [photoColors.lightBlue]: screenColors.lightBlue,
  [photoColors.orange]: screenColors.orange,
  [photoColors.mint]: screenColors.mint,
  [photoColors.skin]: screenColors.skin,
  [photoColors.yellow]: screenColors.yellow,
};

// mappings between photo colors and variations for each image. Comes in addition to default colors.
// NB: photo colors must include ALL colors we expect to find in image, including black and white.
// TODO: Make black, white and skin color default?
export const mappings = {
  [imageCodes.kar1]: {
    photo: [
      photoColors.black,
      photoColors.mint,
      photoColors.skin,
      photoColors.pu,
      photoColors.skin,
    ],
    [variations.manhattan]: {
      [photoColors.black]: screenColors.black,
      [photoColors.yellow]: screenColors.yellow,
      [photoColors.white]: screenColors.white,
      [photoColors.skin]: screenColors.skin,
    },
    [variations.telly]: {},
    [variations.people]: {},
  },
  [imageCodes.lady2]: {
    photo: [
      photoColors.black,
      photoColors.white,
    ],
    [variations.manhattan]: {},
    [variations.telly]: {},
    [variations.people]: {},
  },
  [imageCodes.man1]: {
    photo: [
      photoColors.black,
      photoColors.white,
    ],
  },
  [imageCodes.man2]: {
    photo: [
      photoColors.black,
      photoColors.white,
    ],
  },
};