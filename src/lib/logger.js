import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const isCloudEnvironment = ['production', 'staging'].includes(process.env.ENVIRONMENT);
const transports = [new winston.transports.Console()];
if (!isCloudEnvironment) {
  transports.push(new winston.transports.File({ filename: 'logs/app.log' }));
}

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat
  ),
  transports
});

export default logger;