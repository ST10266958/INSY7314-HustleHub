const path = require('path');
const winston = require('winston');
const { nodeEnv, logDir } = require('./env');

// Secrets must never reach a log file, even if a developer logs a whole object by mistake.
const SENSITIVE_KEY = /pass(word)?|token|secret|authorization|hash/i;
const redact = winston.format((info) => {
  Object.keys(info).forEach((key) => {
    if (SENSITIVE_KEY.test(key)) info[key] = '[REDACTED]'; // eslint-disable-line security/detect-object-injection
  });
  return info;
});

// Only events tagged category=audit go to audit.log (security-relevant events).
const onlyAudit = winston.format((info) => (info.category === 'audit' ? info : false));

const rotation = { maxsize: 5 * 1024 * 1024, maxFiles: 5, tailable: true };
const isTest = nodeEnv === 'test';

const transports = [
  new winston.transports.Console({
    silent: isTest || process.env.LOG_SILENT === 'true',
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  }),
];

if (!isTest) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.json(),
      ...rotation,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: winston.format.json(),
      ...rotation,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      format: winston.format.combine(onlyAudit(), winston.format.json()),
      ...rotation,
    })
  );
}

const logger = winston.createLogger({
  level: nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redact()
  ),
  defaultMeta: { service: 'hustlehub-backend' },
  transports,
});

module.exports = logger;
