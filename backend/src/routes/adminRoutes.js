const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');
const { mongoIdParamValidation } = require('../middleware/validationMiddleware');
const {
  listUsers,
  listGigs,
  listBookings,
  listTransactions,
  deleteGig,
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/users', listUsers);
router.get('/gigs', listGigs);
router.get('/bookings', listBookings);
router.get('/transactions', listTransactions);
router.delete('/gigs/:id', mongoIdParamValidation, deleteGig);

module.exports = router;
