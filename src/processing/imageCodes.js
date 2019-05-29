const profiles = {
  default: {
    gender: 'm',
    bitCode: 0
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