const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/my-profile', ctrl.getMyProfile);
router.get('/:id', ctrl.getOne);
router.put('/:id', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), ctrl.updateDriver);
router.delete('/:id', authorize('FLEET_MANAGER'), ctrl.removeDriver);

module.exports = router;
