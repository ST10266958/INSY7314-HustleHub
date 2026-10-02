const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');
const { getMyIncome } = require('../controllers/incomeController');

const router = express.Router();

router.get('/', requireAuth, requireRole(ROLES.FREELANCER), getMyIncome);

module.exports = router;
