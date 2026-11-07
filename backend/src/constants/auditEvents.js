const AUDIT_EVENTS = Object.freeze({
  USER_REGISTERED: 'auth.register',
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGIN_BLOCKED: 'auth.login.blocked',
  ACCOUNT_LOCKED: 'auth.account.locked',
  TOKEN_REJECTED: 'auth.token.rejected',
  ACCESS_DENIED: 'access.denied',
  RATE_LIMITED: 'security.rate_limited',
  GIG_CREATED: 'gig.created',
  GIG_UPDATED: 'gig.updated',
  GIG_DELETED: 'gig.deleted',
  BOOKING_CREATED: 'booking.created',
  BOOKING_REJECTED: 'booking.rejected',
  TRANSACTION_RECORDED: 'transaction.recorded',
  ADMIN_GIG_REMOVED: 'admin.gig.removed',
});

module.exports = { AUDIT_EVENTS };
