const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'), ctrl.getAnalytics);

module.exports = router;
