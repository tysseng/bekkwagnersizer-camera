// run a mapper function on the value of each entry in an object.
const objMapper = (toMap, mapper) => {
  const mapped = {};
  Object.entries(toMap).forEach(([key, value]) => {
    mapped[key] = mapper(value);
  });
  return mapped;
};

export default objMapper;