const express = require('express');
const router = express.Router();
const principalController = require('../controllers/principalController');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/principal/pending-staff-reviews
 * @desc    Get forwarded staff requests for Principal review
 * @access  Private-Principal
 */
router.get('/pending-staff-reviews', verifyToken, requireRole('principal'), principalController.getPendingStaffReviews);

/**
 * @route   GET /api/principal/pending-hod-reviews
 * @desc    Get HOD requests for Principal review
 * @access  Private-Principal
 */
router.get('/pending-hod-reviews', verifyToken, requireRole('principal'), principalController.getPendingHodReviews);

/**
 * @route   GET /api/principal/report
 * @desc    Get comprehensive global leave report
 * @access  Private-Principal
 */
router.get('/report', verifyToken, requireRole('principal'), principalController.getReport);

/**
 * @route   GET /api/principal/report/export
 * @desc    Generate CSV export of global report
 * @access  Private-Principal
 */
router.get('/report/export', verifyToken, requireRole('principal'), principalController.exportReport);

module.exports = router;
