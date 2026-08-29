const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn, issuer: 'hustlehub-plus' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret, { issuer: 'hustlehub-plus' });
}

module.exports = { signToken, verifyToken };