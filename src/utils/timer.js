export const timed = (toCall, msg) => {
  const before = new Date().getTime();
  const result = toCall();
  const after = new Date().getTime();
  const time = after - before;
  console.log('TIMED', msg, time);
  return result;
};