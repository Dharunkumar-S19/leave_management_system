const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/staff/pending-reviews
 * @desc    Get pending student leave requests assigned to this staff
 * @access  Private-Staff
 */
router.get('/pending-reviews', verifyToken, requireRole('staff'), staffController.getPendingReviews);

/**
 * @route   POST /api/staff/leaves/:id/forward
 * @desc    Forward student leave to HOD
 * @access  Private-Staff
 */
router.post('/leaves/:id/forward', verifyToken, requireRole('staff'), staffController.forwardStudentLeave);

/**
 * @route   POST /api/staff/leaves/:id/reject
 * @desc    Reject student leave
 * @access  Private-Staff
 */
router.post('/leaves/:id/reject', verifyToken, requireRole('staff'), staffController.rejectStudentLeave);

module.exports = router;
