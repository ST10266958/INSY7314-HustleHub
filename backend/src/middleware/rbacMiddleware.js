const AppError = require('../utils/AppError');
const { audit } = require('../utils/audit');
const { AUDIT_EVENTS } = require('../constants/auditEvents');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      audit(AUDIT_EVENTS.ACCESS_DENIED, {
        req,
        outcome: 'denied',
        details: { role: req.user?.role, required: allowedRoles },
      });
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
}

module.exports = { requireRole };
