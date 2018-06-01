import { imageCodes } from './imageCodes';
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

// All colors to use for replacing.
const screenColorsManhattan = {
  black: color('#000000'),
  white: color('#ffffff'),
  purple: color('#b8529e'),
  middleBlue: color('#778bc3'),
  darkBlue: color('#4272b8'),
  lightBlue: color('#caeaf2'),
  middleGreen: color('#8ecb8b'),
  lightGreen: color('#bedfb2'),
  darkGreen: color('#5eb55a'),
  red: color('#c92128'),
  orange: color('#f26a26'),
  paleOrange: color('#f26b56'),
  darkYellow: color('#faa81a'),
  yellow: color('#f5eb0d'),
  lightYellow: color('#f8f3a0'),
  skin: color('#f7b1c1'),
};

const screenColorsKingsCross1 = {
  black: color('#000000'),
  white: color('#ffffff'),
  skin: color('#f7b1c1'),
  pink: color('#ee7cae'),
  red: color('#c92128'),
  middleGreen: color('#8ecb8b'),
  lightGreen: color('#bedfb2'),
  lightYellow: color('#f8f3a0'),
  yellow: color('#f5eb0d'),
  gold: color('#efc52f'),
  orange: color('#fcbf20'),
  blue: color('#4172b8'),
  middleBlue: color('#778bc3'),
};

const screenColorsKingsCross2 = {
  black: color('#000000'),
  white: color('#ffffff'),
  lightYellow: color('#f8f3a0'),
  skin: color('#f7b1c1'),
  peach: color('#f0976f'),
  red: color('#c92128'),
  middleGreen: color('#8ecb8b'),
  blue: color('#4172b8'),
  yellow: color('#f5eb0d'),
  orange: color('#fcbf20'),
};

// Default mappings to use for the variations, if no other mapping is found.

export const getDefaultMappings = () => {
  const defaultMappings = [];
  defaultMappings[variations.people] = {
    [photoColors.black]: screenColorsPeople.black,
    [photoColors.white]: screenColorsPeople.white,
    [photoColors.skin]: screenColorsPeople.skin,
  };
  defaultMappings[variations.manhattan] = {
    [photoColors.black]: screenColorsManhattan.black,
    [photoColors.white]: screenColorsManhattan.white,
    [photoColors.skin]: screenColorsManhattan.skin,
  };
  defaultMappings[variations.kingscross1] = {
    [photoColors.black]: screenColorsKingsCross1.black,
    [photoColors.white]: screenColorsKingsCross1.white,
    [photoColors.skin]: screenColorsKingsCross1.skin,
  };
  defaultMappings[variations.kingscross2] = {
    [photoColors.black]: screenColorsKingsCross2.black,
    [photoColors.white]: screenColorsKingsCross2.white,
    [photoColors.skin]: screenColorsKingsCross2.skin,
  };
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
      [photoColors.lightBlue]: screenColorsPeople.black,
      [photoColors.orange]: screenColorsPeople.yellow,
    },
    [variations.manhattan]: {
      [photoColors.green]: screenColorsManhattan.middleGreen,
      [photoColors.purple]: screenColorsManhattan.white,
      [photoColors.lightBlue]: screenColorsManhattan.lightBlue,
      [photoColors.orange]: screenColorsManhattan.lightYellow,
    },
    [variations.kingscross1]: {
      [photoColors.green]: screenColorsKingsCross1.gold,
      [photoColors.purple]: screenColorsKingsCross1.white,
      [photoColors.lightBlue]: screenColorsKingsCross1.pink,
      [photoColors.orange]: screenColorsKingsCross1.lightYellow,
    },
    [variations.kingscross2]: {
      [photoColors.green]: screenColorsKingsCross2.peach,
      [photoColors.purple]: screenColorsKingsCross2.white,
      [photoColors.lightBlue]: screenColorsKingsCross2.blue,
      [photoColors.orange]: screenColorsKingsCross2.lightYellow,
    },
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.lightYellow,
      [photoColors.green]: screenColorsManhattan.white,
      [photoColors.lightBlue]: screenColorsManhattan.red,
      [photoColors.purple]: screenColorsManhattan.skin,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.gold,
      [photoColors.green]: screenColorsKingsCross1.white,
      [photoColors.lightBlue]: screenColorsKingsCross1.red,
      [photoColors.purple]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.peach,
      [photoColors.green]: screenColorsKingsCross2.white,
      [photoColors.lightBlue]: screenColorsKingsCross2.red,
      [photoColors.purple]: screenColorsKingsCross2.blue,
    },
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
    [variations.manhattan]: {
      [photoColors.wine]: screenColorsManhattan.red,
      [photoColors.green]: screenColorsManhattan.white,
      [photoColors.lightBlue]: screenColorsManhattan.white,
    },
    [variations.kingscross1]: {
      [photoColors.wine]: screenColorsKingsCross1.gold,
      [photoColors.green]: screenColorsKingsCross1.pink,
      [photoColors.lightBlue]: screenColorsKingsCross1.white,
    },
    [variations.kingscross2]: {
      [photoColors.wine]: screenColorsKingsCross2.peach,
      [photoColors.green]: screenColorsKingsCross2.blue,
      [photoColors.lightBlue]: screenColorsKingsCross2.white,
    }
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
    [variations.manhattan]: {
      [photoColors.orange]: screenColorsManhattan.darkYellow,
      [photoColors.green]: screenColorsManhattan.white,
      [photoColors.purple]: screenColorsManhattan.darkBlue,
      [photoColors.lightBlue]: screenColorsManhattan.lightBlue,
    },
    [variations.kingscross1]: {
      [photoColors.orange]: screenColorsKingsCross1.gold,
      [photoColors.green]: screenColorsKingsCross1.white,
      [photoColors.purple]: screenColorsKingsCross1.blue,
      [photoColors.lightBlue]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.orange]: screenColorsKingsCross2.peach,
      [photoColors.green]: screenColorsKingsCross2.white,
      [photoColors.purple]: screenColorsKingsCross2.blue,
      [photoColors.lightBlue]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.purple]: screenColorsManhattan.orange,
      [photoColors.lightBlue]: screenColorsManhattan.orange,
      [photoColors.yellow]: screenColorsManhattan.white,
      [photoColors.green]: screenColorsManhattan.darkYellow,
    },
    [variations.kingscross1]: {
      [photoColors.purple]: screenColorsKingsCross1.gold,
      [photoColors.lightBlue]: screenColorsKingsCross1.pink,
      [photoColors.yellow]: screenColorsKingsCross1.white,
      [photoColors.green]: screenColorsKingsCross1.middleGreen,
    },
    [variations.kingscross2]: {
      [photoColors.purple]: screenColorsKingsCross2.peach,
      [photoColors.lightBlue]: screenColorsKingsCross2.blue,
      [photoColors.yellow]: screenColorsKingsCross2.white,
      [photoColors.green]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.darkBlue]: screenColorsManhattan.middleBlue,
      [photoColors.orange]: screenColorsManhattan.white,
      [photoColors.wine]: screenColorsManhattan.red,
      [photoColors.green]: screenColorsManhattan.darkGreen,
    },
    [variations.kingscross1]: {
      [photoColors.darkBlue]: screenColorsKingsCross1.gold,
      [photoColors.orange]: screenColorsKingsCross1.white,
      [photoColors.wine]: screenColorsKingsCross1.red,
      [photoColors.green]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.darkBlue]: screenColorsKingsCross2.peach,
      [photoColors.orange]: screenColorsKingsCross2.white,
      [photoColors.wine]: screenColorsKingsCross2.red,
      [photoColors.green]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.lightBlue]: screenColorsManhattan.white,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.purple]: screenColorsManhattan.paleOrange,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.purple]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.purple]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.orange]: screenColorsManhattan.lightYellow,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.orange]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.orange]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.orange]: screenColorsManhattan.white,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.orange]: screenColorsKingsCross1.white,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.orange]: screenColorsKingsCross2.white,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.green]: screenColorsManhattan.white,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.green]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.green]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.lightBlue]: screenColorsManhattan.middleBlue,
      [photoColors.wine]: screenColorsManhattan.lightBlue,
      [photoColors.orange]: screenColorsManhattan.darkYellow,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross1.middleBlue,
      [photoColors.wine]: screenColorsKingsCross1.white,
      [photoColors.orange]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross2.peach,
      [photoColors.wine]: screenColorsKingsCross2.white,
      [photoColors.orange]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.darkBlue]: screenColorsManhattan.middleBlue,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.darkBlue]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.darkBlue]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.green]: screenColorsManhattan.darkGreen,
      [photoColors.lightBlue]: screenColorsManhattan.middleBlue,
      [photoColors.darkBlue]: screenColorsManhattan.white,
      [photoColors.orange]: screenColorsManhattan.yellow,
      [photoColors.wine]: screenColorsManhattan.darkGreen,
    },
    [variations.kingscross1]: {
      [photoColors.green]: screenColorsKingsCross1.gold,
      [photoColors.lightBlue]: screenColorsKingsCross1.middleBlue,
      [photoColors.darkBlue]: screenColorsKingsCross1.white,
      [photoColors.orange]: screenColorsKingsCross1.yellow,
      [photoColors.wine]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.green]: screenColorsKingsCross2.peach,
      [photoColors.lightBlue]: screenColorsKingsCross2.peach,
      [photoColors.darkBlue]: screenColorsKingsCross2.white,
      [photoColors.orange]: screenColorsKingsCross2.yellow,
      [photoColors.wine]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.darkBlue]: screenColorsManhattan.middleBlue,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.darkBlue]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.darkBlue]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.purple]: screenColorsManhattan.paleOrange,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.purple]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.purple]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.orange]: screenColorsManhattan.lightYellow,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.orange]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.orange]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.white,
      [photoColors.purple]: screenColorsManhattan.middleBlue,
      [photoColors.wine]: screenColorsManhattan.paleOrange,
      [photoColors.darkBlue]: screenColorsManhattan.middleBlue,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.white,
      [photoColors.purple]: screenColorsKingsCross1.gold,
      [photoColors.wine]: screenColorsKingsCross1.red,
      [photoColors.darkBlue]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.white,
      [photoColors.purple]: screenColorsKingsCross2.peach,
      [photoColors.wine]: screenColorsKingsCross2.red,
      [photoColors.darkBlue]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.wine]: screenColorsManhattan.white,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.wine]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.wine]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.lightBlue]: screenColorsManhattan.middleBlue,
      [photoColors.purple]: screenColorsManhattan.white,
      [photoColors.green]: screenColorsManhattan.darkGreen,
      [photoColors.orange]: screenColorsManhattan.black,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross1.middleBlue,
      [photoColors.purple]: screenColorsKingsCross1.white,
      [photoColors.green]: screenColorsKingsCross1.pink,
      [photoColors.orange]: screenColorsKingsCross1.black,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross2.middleGreen,
      [photoColors.purple]: screenColorsKingsCross2.white,
      [photoColors.green]: screenColorsKingsCross2.blue,
      [photoColors.orange]: screenColorsKingsCross2.black,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.lightBlue]: screenColorsManhattan.middleBlue,
      [photoColors.green]: screenColorsManhattan.white,
      [photoColors.orange]: screenColorsManhattan.darkYellow,
      [photoColors.wine]: screenColorsManhattan.red,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross1.middleBlue,
      [photoColors.green]: screenColorsKingsCross1.white,
      [photoColors.orange]: screenColorsKingsCross1.gold,
      [photoColors.wine]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross2.blue,
      [photoColors.green]: screenColorsKingsCross2.white,
      [photoColors.orange]: screenColorsKingsCross2.orange,
      [photoColors.wine]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.wine]: screenColorsManhattan.white,
      [photoColors.orange]: screenColorsManhattan.lightYellow,
      [photoColors.lightBlue]: screenColorsManhattan.lightBlue,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.wine]: screenColorsKingsCross1.white,
      [photoColors.orange]: screenColorsKingsCross1.lightYellow,
      [photoColors.lightBlue]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.wine]: screenColorsKingsCross2.white,
      [photoColors.orange]: screenColorsKingsCross2.lightYellow,
      [photoColors.lightBlue]: screenColorsKingsCross2.blue,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.lightBlue]: screenColorsManhattan.white,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.lightBlue]: screenColorsKingsCross2.middleGreen,
    }
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
    [variations.manhattan]: {
      [photoColors.yellow]: screenColorsManhattan.yellow,
      [photoColors.orange]: screenColorsManhattan.lightYellow,
    },
    [variations.kingscross1]: {
      [photoColors.yellow]: screenColorsKingsCross1.yellow,
      [photoColors.orange]: screenColorsKingsCross1.pink,
    },
    [variations.kingscross2]: {
      [photoColors.yellow]: screenColorsKingsCross2.yellow,
      [photoColors.orange]: screenColorsKingsCross2.middleGreen,
    }
  },
});