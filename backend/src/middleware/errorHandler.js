const logger = require('../config/logger');
const { nodeEnv } = require('../config/env');

function errorHandler(err, req, res, next) {
  // Client mistakes raised by body-parser (bad JSON, body too large) are 4xx, not server errors.
  const isBodyParserError = typeof err.type === 'string' && err.type.startsWith('entity.') && err.status >= 400 && err.status < 500;
  let statusCode = err.isOperational && err.statusCode ? err.statusCode : 500;
  let message = err.isOperational ? err.message : 'An unexpected error occurred. Please try again later.';
  if (isBodyParserError) {
    statusCode = err.status;
    message = err.status === 413 ? 'Request body is too large.' : 'Request body could not be parsed.';
  }

  logger[statusCode >= 500 ? 'error' : 'warn']('Request error', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    statusCode,
  });

  const body = { success: false, message };
  if (nodeEnv === 'development') {
    body.hint = 'See server logs for full detail (stack traces are never returned in the response).';
  }

  res.status(statusCode).json(body);
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Resource not found.' });
}

module.exports = { errorHandler, notFoundHandler };