import chalk from 'chalk';
/*
Logger class for easy and aesthetically pleasing console logging
*/

const Level = {};
Level.ERROR = 'error';
Level.WARN = 'warn';
Level.INFO = 'info';
Level.DEBUG = 'debug';

const LevelMap = {};
LevelMap[Level.ERROR] = 4;
LevelMap[Level.WARN] = 3;
LevelMap[Level.INFO] = 2;
LevelMap[Level.DEBUG] = 1;

let logLevel;
function getTimeStamp(timestamp){
  if(!timestamp) timestamp = Date.now()
  let dateTime = new Date(timestamp)
  return dateTime.toLocaleString('en-US', { timeZone: 'Etc/GMT+5', hour12: false })
}
function getContent(content){
  try{
    if(logLevel === 1) return content
    if(content?.message) return content.message
    return content
  }catch(e){
    return content
  }
}
function setLevel(level = Level.INFO) {
  if (LevelMap.hasOwnProperty(level)) {
    logLevel = LevelMap[level];
  } else {
    logLevel = LevelMap[Level.INFO];
  }
}
setLevel(Level.INFO);

function log(type, content) {
  if (logLevel <= LevelMap[type]) {
    switch (type) {
      case Level.ERROR: {
        console.error(`${getTimeStamp(Date.now())} ${chalk.bgRed(type.toUpperCase())} ${content}`);
        return
      }
      case Level.WARN: {
        console.warn(`${getTimeStamp(Date.now())} ${chalk.black.bgYellow(type.toUpperCase())} ${content}`);
        return
      }
      case Level.INFO: {
        console.log(`${getTimeStamp(Date.now())} ${chalk.bgBlue(type.toUpperCase())} ${content}`);
        return
      }
      case Level.DEBUG: {
        return console.log(`${getTimeStamp(Date.now())} ${chalk.green(type.toUpperCase())} ${content}`);
      }
      default: throw new TypeError('Logger type must be either error, warn, info/log, or debug.');
    }

  }
};
const Cmd = {
  setLevel: setLevel,
  Level,
  error: (content) => log(Level.ERROR, content),
  warn: (content) => log(Level.WARN, content),
  info: (content) => log(Level.INFO, content),
  log: (content) => log(Level.INFO, content),
  debug: (content) => log(Level.DEBUG, content)
}
export default Cmd
