const express = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');
const { mongoIdParamValidation, auditQueryValidation } = require('../middleware/validationMiddleware');
const {
  listUsers,
  listGigs,
  listBookings,
  listTransactions,
  deleteGig,
  listAuditLogs,
  getAuditSummary,
} = require('../controllers/adminController');

const router = express.Router();

router.use(apiLimiter);
router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/users', listUsers);
router.get('/gigs', listGigs);
router.get('/bookings', listBookings);
router.get('/transactions', listTransactions);
router.get('/audit-logs/summary', getAuditSummary);
router.get('/audit-logs', auditQueryValidation, listAuditLogs);
router.delete('/gigs/:id', mongoIdParamValidation, deleteGig);

module.exports = router;
