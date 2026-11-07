const rateLimit = require('express-rate-limit');
const { audit } = require('../utils/audit');
const { AUDIT_EVENTS } = require('../constants/auditEvents');

// Builds a per-IP limiter that also writes a security event whenever someone is throttled.
function createLimiter({ windowMs, max, message, name }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      audit(AUDIT_EVENTS.RATE_LIMITED, { req, outcome: 'denied', details: { limiter: name } });
      res.status(429).json({ success: false, message });
    },
  });
}

module.exports = { createLimiter };
