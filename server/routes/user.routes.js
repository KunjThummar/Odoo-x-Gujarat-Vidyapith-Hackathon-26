const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, userController.getUsers);
router.get('/managers', authenticate, userController.getManagers);

module.exports = router;
