import logger from "../utils/logger";

const success = () => {
  fetch('http://localhost:3007/blink?r=63&g=255&b=92&duration=1000&times=4', {
    method: 'GET',
  });
  logger.info('SUCCESS!');
};

const failure = () => {
  fetch('http://localhost:3007/blink?r=255&g=0&b=0&duration=1000&times=4', {
    method: 'GET',
  });
  logger.info('FAILURE!');
};

const colorsCalibrated = () => {
  fetch('http://localhost:3007/blink?r=255&g=255&b=0&duration=1000&times=4', {
    method: 'GET',
  });
  logger.info('CALIBRATED!');
};

const processing = () => {
  fetch('http://localhost:3007/spin?r=23&g=23&b=229&speed=20', {
    method: 'GET',
  });
  logger.info('PROCESSING');
};

const normal = () => {
  fetch('http://localhost:3007/off', {
    method: 'GET',
  });
  logger.info('RETURNING TO NORMAL!');
};

export default {
  success,
  failure,
  normal,
  processing,
  colorsCalibrated,
}