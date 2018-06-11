const logger: Logger = {
  info: (msg) => {
    console.log('INFO', msg);
  },
  warn: (msg) => {
    console.log('WARN', msg);
  },
  error: (msg) => {
    console.log('ERROR', msg);
  },
};

export default logger;