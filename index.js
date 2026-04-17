global.baseDir = import.meta.dirname;
import log from './src/logger.js';

let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
process.on('unhandledRejection', (error) => {
  log.error(error);
});
import './src/index.js';
