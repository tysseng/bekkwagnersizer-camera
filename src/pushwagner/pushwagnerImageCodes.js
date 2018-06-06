const profiles = {
  kar1: {
    gender: 'm',
    bitCode: 1
  },
  kar2: {
    gender: 'm',
    bitCode: 2,
  },
  kar3: {
    gender: 'm',
    bitCode: 4,
  },
  kar4: {
    gender: 'm',
    bitCode: 8,
  },
  kar5: {
    gender: 'm',
    bitCode: 16,
  },
  kar6: {
    gender: 'm',
    bitCode: 31,
  },
  kar7: {
    gender: 'f',
    bitCode: 24,
  },
  kar8: {
    gender: 'f',
    bitCode: 10,
  },
  kar9: {
    gender: 'f',
    bitCode: 18,
  },
  kar10: {
    gender: 'm',
    bitCode: 17,
  },
  kar11: {
    gender: 'm',
    bitCode: 12,
  },
  kar12: {
    gender: 'f',
    bitCode: 20,
  },
  kar13: {
    gender: 'm',
    bitCode: 9,
  },
  kar14: {
    gender: 'f',
    bitCode: 6,
  },
  kar15: {
    gender: 'm',
    bitCode: 5,
  },
  // 16 is removed
  kar17: {
    gender: 'f',
    bitCode: 28,
  },
  kar18: {
    gender: 'f',
    bitCode: 26,
  },
  kar19: {
    gender: 'f',
    bitCode: 25,
  },
  kar20: {
    gender: 'm',
    bitCode: 22,
  },
  kar21: {
    gender: 'f',
    bitCode: 21,
  },
  kar22: {
    gender: 'm',
    bitCode: 19,
  },
  kar23: {
    gender: 'm',
    bitCode: 14,
  },
  kar24: {
    gender: 'm',
    bitCode: 13,
  },
  kar25: {
    gender: 'f',
    bitCode: 11,
  },
  kar26: {
    gender: 'f',
    bitCode: 7,
  },
};

// add id to all profiles.
Object.keys(profiles).forEach(key => {
  profiles[key].id = key;
});

export const imageCodes = {};
Object.keys(profiles).forEach(key => imageCodes[key] = profiles[key].bitCode);

export const bitCodeToProfileMap = {};
Object.values(profiles).forEach(profile => {
  bitCodeToProfileMap[profile.bitCode] = profile;
});
