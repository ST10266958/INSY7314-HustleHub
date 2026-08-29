const bcrypt = require('bcryptjs');
const { bcryptSaltRounds } = require('../config/env');

async function hashPassword(plainTextPassword) {
  return bcrypt.hash(plainTextPassword, bcryptSaltRounds);
}

async function comparePassword(plainTextPassword, hash) {
  return bcrypt.compare(plainTextPassword, hash);
}

module.exports = { hashPassword, comparePassword };