const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');
const { createGigValidation, updateGigValidation } = require('../middleware/validationMiddleware');
const {
  createGig,
  listGigs,
  getMyGigs,
  getGigById,
  updateGig,
  deleteGig,
} = require('../controllers/gigController');

const router = express.Router();

router.get('/', listGigs);
router.get('/mine', requireAuth, requireRole(ROLES.FREELANCER), getMyGigs);
router.get('/:id', getGigById);
router.post('/', requireAuth, requireRole(ROLES.FREELANCER), createGigValidation, createGig);
router.put('/:id', requireAuth, requireRole(ROLES.FREELANCER), updateGigValidation, updateGig);
router.delete('/:id', requireAuth, requireRole(ROLES.FREELANCER), deleteGig);

module.exports = router;
