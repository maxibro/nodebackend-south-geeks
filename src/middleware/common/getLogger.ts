import { createLogger, format, transports, Logger } from "winston";

const getLogger = (label?:string): Logger => {
  const logger = createLogger({
    format: format.combine(
      format.label({ label: label }),
      format.timestamp(),
      format.colorize(),
      format.simple()
    ),
    transports: [
      new transports.Console({
        handleExceptions: true
      })
    ],
    level: process.env.LOG_LEVEL
  });  
  return logger;
};

export default  getLogger;
