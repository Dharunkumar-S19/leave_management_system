const express = require('express');
const router = express.Router();
const hodController = require('../controllers/hodController');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/hod/pending-student-reviews
 * @desc    Get forwarded student requests for HOD review
 * @access  Private-HOD
 */
router.get('/pending-student-reviews', verifyToken, requireRole('hod'), hodController.getPendingStudentReviews);

/**
 * @route   GET /api/hod/pending-staff-reviews
 * @desc    Get staff requests for HOD forward
 * @access  Private-HOD
 */
router.get('/pending-staff-reviews', verifyToken, requireRole('hod'), hodController.getPendingStaffReviews);

/**
 * @route   GET /api/hod/report
 * @desc    Get departmental leave analytics for HOD
 * @access  Private-HOD
 */
router.get('/report', verifyToken, requireRole('hod'), hodController.getReport);

/**
 * @route   GET /api/hod/export
 * @desc    Export departmental leave report to CSV
 * @access  Private-HOD
 */
router.get('/export', verifyToken, requireRole('hod'), hodController.exportReport);


module.exports = router;
