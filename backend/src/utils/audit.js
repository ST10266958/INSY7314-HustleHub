const logger = require('../config/logger');
const AuditLog = require('../models/AuditLog');

/**
 * Records a security-relevant event in two places: the log files (audit.log / combined.log)
 * and the AuditLog collection. It never throws, so an audit failure cannot break a request.
 */
async function audit(event, { req, userId, email, outcome = 'success', details = {} } = {}) {
  const entry = {
    event,
    outcome,
    user: userId || req?.user?.sub,
    email,
    ip: req?.ip,
    userAgent: req?.headers?.['user-agent']?.slice(0, 256),
    method: req?.method,
    path: req?.originalUrl?.split('?')[0],
    details,
  };

  const level = outcome === 'failure' || outcome === 'denied' ? 'warn' : 'info';
  logger.log(level, `audit ${event}`, {
    category: 'audit',
    event,
    outcome,
    userId: entry.user,
    email,
    ip: entry.ip,
    method: entry.method,
    path: entry.path,
    details,
  });

  try {
    await AuditLog.create(entry);
  } catch (err) {
    logger.error('Failed to persist audit event', { event, message: err.message });
  }
}

module.exports = { audit };
