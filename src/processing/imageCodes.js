const profiles = {
  kar1: {
    gender: 'M',
    bitCode: 1
  },
  kar2: {
    gender: 'M',
    bitCode: 2,
  },
  kar3: {
    gender: 'M',
    bitCode: 4,
  },
  kar4: {
    gender: 'M',
    bitCode: 8,
  },
  kar5: {
    gender: 'M',
    bitCode: 16,
  },
  kar6: {
    gender: 'M',
    bitCode: 31,
  },
  kar7: {
    gender: 'F',
    bitCode: 24,
  },
  kar8: {
    gender: 'F',
    bitCode: 10,
  },
  kar9: {
    gender: 'F',
    bitCode: 18,
  },
  kar10: {
    gender: 'M',
    bitCode: 17,
  },
  kar11: {
    gender: 'M',
    bitCode: 12,
  },
  kar12: {
    gender: 'F',
    bitCode: 20,
  },
  kar13: {
    gender: 'M',
    bitCode: 9,
  },
  kar14: {
    gender: 'F',
    bitCode: 6,
  },
  kar15: {
    gender: 'M',
    bitCode: 5,
  },
  // 16 is removed
  kar17: {
    gender: 'F',
    bitCode: 28,
  },
  kar18: {
    gender: 'F',
    bitCode: 26,
  },
  kar19: {
    gender: 'F',
    bitCode: 25,
  },
  kar20: {
    gender: 'M',
    bitCode: 22,
  },
  kar21: {
    gender: 'F',
    bitCode: 21,
  },
  kar22: {
    gender: 'M',
    bitCode: 19,
  },
  kar23: {
    gender: 'M',
    bitCode: 14,
  },
  kar24: {
    gender: 'M',
    bitCode: 13,
  },
  kar25: {
    gender: 'F',
    bitCode: 11,
  },
  kar26: {
    gender: 'F',
    bitCode: 7,
  },
};

// add id to all profiles.
Object.keys(profiles).forEach(key => {
  profiles[key].id = key;
});

const imageCodes = {};
Object.keys(profiles).forEach(key => imageCodes[key] = profiles[key].bitCode);

export const bitCodeToProfileMap = {};
Object.values(profiles).forEach(profile => {
  bitCodeToProfileMap[profile.bitCode] = profile;
});

/*
const imageCodes = {
  kar1: 1,
  kar2: 2,
  kar3: 4,
  kar4: 8,
  kar5: 16,
  kar6: 31,
  kar7: 24,
  kar8: 10,
  kar9: 18,
  kar10: 17,
  kar11: 12,
  kar12: 20,
  kar13: 9,
  kar14: 6,
  kar15: 5,
  // 16 is removed
  kar17: 28,
  kar18: 26,
  kar19: 25,
  kar20: 22,
  kar21: 21,
  kar22: 19,
  kar23: 14,
  kar24: 13,
  kar25: 11,
  kar26: 7,
};
*/

export default imageCodes;