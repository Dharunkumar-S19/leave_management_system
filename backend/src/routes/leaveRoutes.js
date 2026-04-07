const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route   POST /api/leaves/apply
 * @desc    Apply for a new leave
 * @access  Private
 */
router.post('/apply', verifyToken, upload.single('attachment'), leaveController.applyLeave);

/**
 * @route   GET /api/leaves/my
 * @desc    Get all leave requests by logged-in user
 * @access  Private
 */
router.get('/my', verifyToken, leaveController.getMyLeaves);

/**
 * @route   GET /api/leaves/balance
 * @desc    Get leave balance for current user
 * @access  Private
 */
router.get('/balance', verifyToken, leaveController.getLeaveBalance);

/**
 * @route   GET /api/leaves/:id/details
 * @desc    Get full leave details and audit log
 * @access  Private
 */
router.get('/:id/details', verifyToken, leaveController.getLeaveDetails);

/**
 * @route   DELETE /api/leaves/:id
 * @desc    Cancel a pending leave request
 * @access  Private
 */
router.delete('/:id', verifyToken, leaveController.cancelLeave);

/**
 * @route   POST /api/leaves/:id/approve
 * @desc    Approve or forward leave (HOD/Principal)
 * @access  Private-HOD/Principal
 */
router.post('/:id/approve', verifyToken, requireRole('hod', 'principal'), leaveController.approveLeave);

/**
 * @route   POST /api/leaves/:id/reject
 * @desc    Reject leave (HOD/Principal)
 * @access  Private-HOD/Principal
 */
router.post('/:id/reject', verifyToken, requireRole('hod', 'principal'), leaveController.rejectLeave);

module.exports = router;
