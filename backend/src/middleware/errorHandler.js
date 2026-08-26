const logger = require('../config/logger');
const { nodeEnv } = require('../config/env');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.isOperational && err.statusCode ? err.statusCode : 500;
  const message = err.isOperational ? err.message : 'An unexpected error occurred. Please try again later.';

  logger.error('Request error', {
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