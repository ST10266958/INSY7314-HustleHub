const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');
const { bookingValidation } = require('../middleware/validationMiddleware');
const {
  createBooking,
  getMyBookingsAsClient,
  getMyBookingsAsFreelancer,
} = require('../controllers/bookingController');

const router = express.Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many booking attempts. Please try again later.' },
});

router.post('/', requireAuth, requireRole(ROLES.CLIENT), bookingLimiter, bookingValidation, createBooking);
router.get('/client', requireAuth, requireRole(ROLES.CLIENT), getMyBookingsAsClient);
router.get('/freelancer', requireAuth, requireRole(ROLES.FREELANCER), getMyBookingsAsFreelancer);

module.exports = router;
