let running = false;

export const isRunning = () => running;

export const startRunning = () => {
  running = true;
};

export const stopRunning = () => {
  running = false;
};