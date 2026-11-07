const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');
const { audit } = require('../utils/audit');
const { AUDIT_EVENTS } = require('../constants/auditEvents');

/*
 * Protects a route: requires a valid "Authorization: Bearer <token>" header.
*/
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    audit(AUDIT_EVENTS.TOKEN_REJECTED, { req, outcome: 'denied', details: { reason: 'missing_or_malformed' } });
    throw new AppError('Authentication required. Provide a valid Bearer token.', 401);
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    // Distinguish an expired token from other verification failures without
    // leaking implementation detail beyond what's useful to a legitimate client.
    audit(AUDIT_EVENTS.TOKEN_REJECTED, {
      req,
      outcome: 'denied',
      details: { reason: err.name === 'TokenExpiredError' ? 'expired' : 'invalid' },
    });
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid authentication token.', 401);
  }
});

module.exports = { requireAuth };
