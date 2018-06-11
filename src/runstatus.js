// @flow
let running = false;

export const isRunning = (): boolean => running;

export const startRunning = () => {
  running = true;
};

export const stopRunning = () => {
  running = false;
};