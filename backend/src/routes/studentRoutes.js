const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/student/notifications
 * @desc    Get notifications for student, mark as read
 * @access  Private-Student
 */
router.get('/notifications', verifyToken, requireRole('student'), studentController.getNotifications);

/**
 * @route   GET /api/student/upcoming-leaves
 * @desc    Get approved leaves from today onwards
 * @access  Private-Student
 */
router.get('/upcoming-leaves', verifyToken, requireRole('student'), studentController.getUpcomingLeaves);

module.exports = router;
