const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');

/*
 * Protects a route: requires a valid "Authorization: Bearer <token>" header.
*/
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication required. Provide a valid Bearer token.', 401);
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    // Distinguish an expired token from other verification failures without
    // leaking implementation detail beyond what's useful to a legitimate client.
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid authentication token.', 401);
  }
});

module.exports = { requireAuth };
