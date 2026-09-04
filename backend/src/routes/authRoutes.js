const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication endpoints are a prime target for credential stuffing and
// brute-force attacks, so they get a tighter rate limit than the rest of
// the API even at this early stage.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);

// Protected route (JWT required) — proves that route protection works
// beyond the login endpoint itself.
router.get('/profile', requireAuth, getProfile);

module.exports = router;
