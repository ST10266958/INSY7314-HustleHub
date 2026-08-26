const userStore = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../config/logger');
const { ROLES } = require('../constants/roles');

const register = asyncHandler(async (req, res) => {
  const { email, password, role = ROLES.CLIENT } = req.body;

  const existing = userStore.findByEmail(email);
  if (existing) {
    // Deliberately generic: confirming "this email already has an account"
    // is a minor enumeration leak but is standard/expected UX for
    // registration forms, unlike login (see below) where we stay silent.
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = userStore.create({ email, passwordHash, role });

  logger.info('User registered', { userId: user.id, role: user.role });

  const token = signToken(user);
  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: { user: userStore.toPublic(user), token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = userStore.findByEmail(email);

  // Same error message and (roughly) same code path whether the email
  // doesn't exist or the password is wrong, so an attacker can't use the
  // response to enumerate which emails are registered.
  if (!user) {
    logger.warn('Login failed: unknown email', { email });
    throw new AppError('Invalid email or password.', 401);
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    logger.warn('Login failed: bad password', { userId: user.id });
    throw new AppError('Invalid email or password.', 401);
  }

  logger.info('User logged in', { userId: user.id });

  const token = signToken(user);
  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: { user: userStore.toPublic(user), token },
  });
});

// A minimal protected route used to prove that JWT validation is enforced
// on requests beyond login, as required by the brief.
const getProfile = asyncHandler(async (req, res) => {
  const user = userStore.findById(req.user.sub);
  if (!user) {
    throw new AppError('User no longer exists.', 404);
  }
  res.status(200).json({ success: true, data: { user: userStore.toPublic(user) } });
});

module.exports = { register, login, getProfile };
