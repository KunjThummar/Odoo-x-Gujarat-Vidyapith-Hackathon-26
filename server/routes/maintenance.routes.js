const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), ctrl.create);
router.put('/:id', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), ctrl.update);
router.put('/:id/complete', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), ctrl.complete);
router.delete('/:id', authorize('FLEET_MANAGER'), ctrl.remove);

module.exports = router;
