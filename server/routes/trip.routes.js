const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/trip.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('FLEET_MANAGER', 'DISPATCHER'), ctrl.create);
router.put('/:id', authorize('FLEET_MANAGER', 'DISPATCHER', 'DRIVER'), ctrl.update);
router.delete('/:id', authorize('FLEET_MANAGER'), ctrl.remove);

module.exports = router;
