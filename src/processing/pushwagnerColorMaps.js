import imageCodes from './imageCodes';
import variations from './sceneVariations';
import { color } from './colorMapping';

// all colors found in photos. Will be changed by calibration!
export const photoColors = {
  black: '#4C5556',
  white: '#F4FEFF',
  lightBlue: '#7CD8EF',
  orange: '#FFB254',
  green: '#8BD19F',
  skin: '#FDC9DF',
  yellow: '#FFEF56',
  wine: '#CF4A6B',
  purple: '#CD68B9',
  darkBlue: '#4D8BDF',
  pink: '#4D8BDF', // bit pattern stars.
};

// All colors to use for replacing.
const screenColorsPeople = {
  black: color('#000000'),
  white: color('#ffffff'),
  darkBlue: color('#483995'),
  blue: color('#4272b8'),
  lightBlue: color('#2ec3e7'),
  mint: color('#8ecb8b'),
  red: color('#c92128'),
  orange: color('#fcbf20'),
  tan: color('#fabfba'),
  yellow: color('#f5eb0d'),
  lightYellow: color('#f8f3a0'),
  skin: color('#f0d8e9'),
};

// Default mappings to use for the variations, if no other mapping is found.

export const getDefaultMappings = () => {
  const defaultMappings = [];
  defaultMappings[variations.people] = {
    [photoColors.black]: screenColorsPeople.black,
    [photoColors.white]: screenColorsPeople.white,
    [photoColors.skin]: screenColorsPeople.skin,
  };
  defaultMappings[variations.manhattan] = {};
  defaultMappings[variations.telly] = {};
  defaultMappings[variations.kingscross] = {};
  return defaultMappings;
};


// mappings between photo colors and variations for each image. Comes in addition to default colors.
// NB: photo colors must include ALL colors we expect to find in image, including black and white.
// TODO: Make black, white and skin color default?
export const getMappings = () => ({
  [imageCodes.kar1]: {
    photo: [
      photoColors.black,
      photoColors.green,
      photoColors.skin,
      photoColors.purple,
      photoColors.lightBlue,
      photoColors.orange,
    ],
    [variations.people]: {
      [photoColors.green]: screenColorsPeople.darkBlue,
      [photoColors.purple]: screenColorsPeople.white,
      [photoColors.orange]: screenColorsPeople.yellow,
      [photoColors.lightBlue]: screenColorsPeople.black,
    },
    [variations.manhattan]: {},
    [variations.telly]: {},
  },
  [imageCodes.kar2]: {
    photo: [
      photoColors.black,
      photoColors.yellow,
      photoColors.skin,
      photoColors.green,
      photoColors.lightBlue,
      photoColors.purple,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.darkBlue,
      [photoColors.green]: screenColorsPeople.white,
      [photoColors.lightBlue]: screenColorsPeople.red,
      [photoColors.purple]: screenColorsPeople.black,
    },
    [variations.manhattan]: {},
    [variations.telly]: {},
  },
  [imageCodes.kar3]: {
    photo: [
      photoColors.black,
      photoColors.wine,
      photoColors.skin,
      photoColors.lightBlue,
      photoColors.green,
    ],
    [variations.people]: {
      [photoColors.wine]: screenColorsPeople.darkBlue,
      [photoColors.green]: screenColorsPeople.black,
      [photoColors.lightBlue]: screenColorsPeople.white,
    },
  },
  [imageCodes.kar4]: {
    photo: [
      photoColors.black,
      photoColors.orange,
      photoColors.skin,
      photoColors.green,
      photoColors.purple,
      photoColors.lightBlue,
    ],
    [variations.people]: {
      [photoColors.orange]: screenColorsPeople.darkBlue,
      [photoColors.green]: screenColorsPeople.white,
      [photoColors.purple]: screenColorsPeople.blue,
      [photoColors.lightBlue]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar5]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.purple,
      photoColors.yellow,
      photoColors.green,
      photoColors.lightBlue,
    ],
    [variations.people]: {
      [photoColors.purple]: screenColorsPeople.darkBlue,
      [photoColors.lightBlue]: screenColorsPeople.black,
      [photoColors.yellow]: screenColorsPeople.white,
      [photoColors.green]: screenColorsPeople.mint,
    },
  },
  [imageCodes.kar6]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.darkBlue,
      photoColors.orange,
      photoColors.wine,
      photoColors.green,
    ],
    [variations.people]: {
      [photoColors.darkBlue]: screenColorsPeople.darkBlue,
      [photoColors.orange]: screenColorsPeople.white,
      [photoColors.wine]: screenColorsPeople.red,
      [photoColors.green]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar7]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
    },
  },
  [imageCodes.kar8]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.lightBlue,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.lightBlue]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar9]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.purple,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.purple]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar10]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.orange,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.orange]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar11]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.orange,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.orange]: screenColorsPeople.white,
    },
  },
  [imageCodes.kar12]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.green,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.green]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar13]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.lightBlue,
      photoColors.wine,
      photoColors.orange,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.lightBlue]: screenColorsPeople.lightBlue,
      [photoColors.wine]: screenColorsPeople.tan,
      [photoColors.orange]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar14]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.darkBlue,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.darkBlue]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar15]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.green,
      photoColors.lightBlue,
      photoColors.darkBlue,
      photoColors.orange,
      photoColors.wine,
    ],
    [variations.people]: {
      [photoColors.green]: screenColorsPeople.darkBlue,
      [photoColors.lightBlue]: screenColorsPeople.lightBlue,
      [photoColors.darkBlue]: screenColorsPeople.white,
      [photoColors.orange]: screenColorsPeople.yellow,
      [photoColors.wine]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar17]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.darkBlue,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.darkBlue]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar18]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.purple,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.purple]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar19]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.orange,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.orange]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar20]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.purple,
      photoColors.wine,
      photoColors.darkBlue,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.white,
      [photoColors.purple]: screenColorsPeople.darkBlue,
      [photoColors.wine]: screenColorsPeople.red,
      [photoColors.darkBlue]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar21]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.wine,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.wine]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar22]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.lightBlue,
      photoColors.purple,
      photoColors.green,
      photoColors.orange,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.lightBlue]: screenColorsPeople.lightBlue,
      [photoColors.purple]: screenColorsPeople.white,
      [photoColors.green]: screenColorsPeople.black,
      [photoColors.orange]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar23]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.lightBlue,
      photoColors.green,
      photoColors.orange,
      photoColors.wine,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.lightBlue]: screenColorsPeople.lightBlue,
      [photoColors.green]: screenColorsPeople.white,
      [photoColors.orange]: screenColorsPeople.orange,
      [photoColors.wine]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar24]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.wine,
      photoColors.orange,
      photoColors.lightBlue,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.wine]: screenColorsPeople.white,
      [photoColors.orange]: screenColorsPeople.lightYellow,
      [photoColors.lightBlue]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar25]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.lightBlue,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.lightBlue]: screenColorsPeople.black,
    },
  },
  [imageCodes.kar26]: {
    photo: [
      photoColors.black,
      photoColors.skin,
      photoColors.yellow,
      photoColors.orange,
    ],
    [variations.people]: {
      [photoColors.yellow]: screenColorsPeople.yellow,
      [photoColors.orange]: screenColorsPeople.black,
    },
  },
});