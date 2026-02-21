const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/register-driver', auth.registerDriver);
router.post('/forgot-password', auth.forgotPassword);
router.post('/verify-otp', auth.verifyOtp);
router.post('/reset-password', auth.resetPassword);
router.get('/me', authenticate, auth.getMe);

module.exports = router;
