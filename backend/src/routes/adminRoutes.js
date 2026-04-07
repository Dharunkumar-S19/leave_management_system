const express = require('express');
const router = express.Router();
const { verifyToken: authenticate, requireRole } = require('../middleware/auth');
const {
  getPrincipalRequests,
  approveLeave,
  rejectLeave,
  getAllUsers,
  toggleUserStatus,
  getAllLeaves,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Principal leave management
router.get('/principal-requests', getPrincipalRequests);
router.post('/approve/:id', approveLeave);
router.post('/reject/:id', rejectLeave);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle', toggleUserStatus);

// System-wide leave report
router.get('/all-leaves', getAllLeaves);

module.exports = router;
