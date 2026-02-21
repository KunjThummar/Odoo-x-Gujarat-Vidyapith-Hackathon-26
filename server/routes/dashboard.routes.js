const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getDashboard);

module.exports = router;
