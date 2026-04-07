const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications & unread count
 * @access  Private (All Roles)
 */
router.get('/', verifyToken, notificationController.getAllNotifications);

/**
 * @route   PUT /api/notifications/mark-read
 * @desc    Mark all unread notifications as read
 * @access  Private (All Roles)
 */
router.put('/mark-read', verifyToken, notificationController.markAllAsRead);

module.exports = router;
