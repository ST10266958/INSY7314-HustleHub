const express = require('express');
const { createLimiter } = require('../middleware/rateLimiter');
const { register, login, getProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const {
  registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation,
} = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication endpoints are a prime target for credential stuffing and
// brute-force attacks, so they get a tighter rate limit than the rest of the API.
// This limits requests per IP; the account lockout in authController limits per account.
const authLimiter = createLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many attempts. Please try again later.',
});

// Each reset request sends an email and each confirm costs a bcrypt hash, so these are throttled harder than login.
const resetLimiter = createLimiter({
  name: 'password-reset',
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many password reset attempts. Please try again later.',
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/forgot-password', resetLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetLimiter, resetPasswordValidation, resetPassword);
router.get('/profile', requireAuth, getProfile);

module.exports = router;
