const objMapper = (toMap, mapper) => {
  const mapped = {};
  Object.keys(toMap).forEach(key => {
    mapped[key] = mapper(toMap[key]);
  });
  return mapped;
};

export default objMapper;