import config from "../config";

export const timed = (toCall, msg) => {
  const before = new Date().getTime();
  const result = toCall();
  const after = new Date().getTime();
  const time = after - before;
  if(config.showTimings)console.log('TIMED', msg, time);
  return result;
};