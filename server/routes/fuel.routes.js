const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fuel_expense.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAllFuel);
router.post('/', authorize('FLEET_MANAGER', 'DISPATCHER'), ctrl.createFuel);
router.put('/:id', authorize('FLEET_MANAGER', 'DISPATCHER'), ctrl.updateFuel);
router.delete('/:id', authorize('FLEET_MANAGER'), ctrl.deleteFuel);

module.exports = router;
