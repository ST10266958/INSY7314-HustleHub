const express = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');
const {
  createGigValidation,
  updateGigValidation,
  mongoIdParamValidation,
} = require('../middleware/validationMiddleware');
const {
  createGig,
  listGigs,
  getMyGigs,
  getGigById,
  updateGig,
  deleteGig,
} = require('../controllers/gigController');

const router = express.Router();

router.use(apiLimiter);

router.get('/', listGigs);
router.get('/mine', requireAuth, requireRole(ROLES.FREELANCER), getMyGigs);
router.get('/:id', mongoIdParamValidation, getGigById);
router.post('/', requireAuth, requireRole(ROLES.FREELANCER), createGigValidation, createGig);
router.put('/:id', requireAuth, requireRole(ROLES.FREELANCER), mongoIdParamValidation, updateGigValidation, updateGig);
router.delete('/:id', requireAuth, requireRole(ROLES.FREELANCER), mongoIdParamValidation, deleteGig);

module.exports = router;
