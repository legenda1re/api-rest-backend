const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'card_number', 'authorization'];

const sanitize = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  return sanitized;
};

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const log = {
      timestamp,
      level,
      message,
      ...(stack ? { stack } : {}),
      ...(Object.keys(meta).length ? { meta: sanitize(meta) } : {}),
    };
    return JSON.stringify(log);
  })
);

const transports = [];

if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      format: jsonFormat,
    }),
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: jsonFormat,
    })
  );
}

if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports,
  exceptionHandlers: process.env.NODE_ENV !== 'test'
    ? [new DailyRotateFile({ filename: path.join('logs', 'exceptions-%DATE%.log'), datePattern: 'YYYY-MM-DD', maxFiles: '30d' })]
    : [],
  rejectionHandlers: process.env.NODE_ENV !== 'test'
    ? [new DailyRotateFile({ filename: path.join('logs', 'rejections-%DATE%.log'), datePattern: 'YYYY-MM-DD', maxFiles: '30d' })]
    : [],
});

module.exports = logger;
