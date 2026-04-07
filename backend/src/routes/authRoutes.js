const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Get user login credentials
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get logged-in user profile + leave balance
 * @access  Private
 */
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
