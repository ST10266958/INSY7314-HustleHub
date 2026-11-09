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

// One shared limiter for the general API (reads and writes that are not login or booking).
// 300 requests per 15 minutes per IP is far above normal use of the frontend but stops scripted floods.
const apiLimiter = createLimiter({
  name: 'api',
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests. Please try again later.',
});

module.exports = { createLimiter, apiLimiter };
