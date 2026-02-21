const express = require('express');
const router = express.Router();
const dispatcherController = require('../controllers/dispatcher.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize('FLEET_MANAGER'), dispatcherController.createDispatcher);
router.get('/', authenticate, dispatcherController.getDispatchers);
router.put('/:id', authenticate, authorize('FLEET_MANAGER'), dispatcherController.updateDispatcher);
router.delete('/:id', authenticate, authorize('FLEET_MANAGER'), dispatcherController.deleteDispatcher);

module.exports = router;
