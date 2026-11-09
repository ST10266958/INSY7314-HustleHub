const express = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');
const { getMyIncome } = require('../controllers/incomeController');

const router = express.Router();

router.use(apiLimiter);

router.get('/', requireAuth, requireRole(ROLES.FREELANCER), getMyIncome);

module.exports = router;
