const crypto = require('crypto');
const userStore = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { audit } = require('../utils/audit');
const { AUDIT_EVENTS } = require('../constants/auditEvents');
const { ROLES } = require('../constants/roles');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { resetTokenMinutes } = require('../config/env');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = asyncHandler(async (req, res) => {
  const { email, password, role = ROLES.CLIENT } = req.body;

  const existing = await userStore.findByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await userStore.create({ email, passwordHash, role });

  audit(AUDIT_EVENTS.USER_REGISTERED, { req, userId: user.id, email: user.email, details: { role: user.role } });

  const token = signToken(user);
  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: { user: userStore.toPublic(user), token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userStore.findByEmail(email);

  if (!user) {
    audit(AUDIT_EVENTS.LOGIN_FAILED, { req, email, outcome: 'failure', details: { reason: 'unknown_email' } });
    throw new AppError('Invalid email or password.', 401);
  }

  // While locked we do not even check the password, so an attacker cannot keep guessing.
  if (userStore.isLocked(user)) {
    audit(AUDIT_EVENTS.LOGIN_BLOCKED, { req, userId: user.id, email, outcome: 'denied', details: { reason: 'account_locked' } });
    throw new AppError('Too many failed login attempts. Please try again later.', 429);
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    const { locked, attempts } = await userStore.registerFailedLogin(user);
    audit(AUDIT_EVENTS.LOGIN_FAILED, { req, userId: user.id, email, outcome: 'failure', details: { reason: 'bad_password', attempts } });
    if (locked) {
      audit(AUDIT_EVENTS.ACCOUNT_LOCKED, { req, userId: user.id, email, outcome: 'denied', details: { reason: 'too_many_failed_logins' } });
    }
    throw new AppError('Invalid email or password.', 401);
  }

  await userStore.resetLoginState(user);
  audit(AUDIT_EVENTS.LOGIN_SUCCESS, { req, userId: user.id, email });

  const token = signToken(user);
  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: { user: userStore.toPublic(user), token },
  });
});

// Same answer whether or not the email exists, so this endpoint cannot be used to discover accounts.
const FORGOT_PASSWORD_MESSAGE = 'If an account exists for that email, a password reset link has been sent.';

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userStore.findByEmail(email);

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + resetTokenMinutes * 60 * 1000);
    await userStore.setResetToken(user, hashToken(token), expires);
    audit(AUDIT_EVENTS.PASSWORD_RESET_REQUESTED, { req, userId: user.id, email, outcome: 'info' });
    // Not awaited: waiting on the mail server would make existing accounts respond measurably slower.
    sendPasswordResetEmail(user.email, token, resetTokenMinutes).catch(() => {});
  } else {
    audit(AUDIT_EVENTS.PASSWORD_RESET_REQUESTED, { req, email, outcome: 'info', details: { reason: 'unknown_email' } });
  }

  res.status(200).json({ success: true, message: FORGOT_PASSWORD_MESSAGE, data: {} });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const passwordHash = await hashPassword(password);
  const user = await userStore.consumeResetToken(hashToken(token), passwordHash);

  if (!user) {
    audit(AUDIT_EVENTS.PASSWORD_RESET_FAILED, { req, outcome: 'failure', details: { reason: 'invalid_or_expired_token' } });
    throw new AppError('Reset link is invalid or has expired.', 400);
  }

  audit(AUDIT_EVENTS.PASSWORD_RESET_COMPLETED, { req, userId: user.id, email: user.email });
  res.status(200).json({ success: true, message: 'Password updated. You can now sign in.', data: {} });
});

// A minimal protected route used to prove that JWT validation is enforced
// on requests beyond login, as required by the brief.
const getProfile = asyncHandler(async (req, res) => {
  const user = await userStore.findById(req.user.sub);
  if (!user) {
    throw new AppError('User no longer exists.', 404);
  }
  res.status(200).json({ success: true, data: { user: userStore.toPublic(user) } });
});

module.exports = { register, login, getProfile, forgotPassword, resetPassword };
