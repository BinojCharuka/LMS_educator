const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  searchStudents,
  resetStudentPassword,
  createUser,
  updateUserRole,
  adminResetPassword,
  getActivityLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Admin-only routes
router.get('/stats',                protect, authorize('admin'), getStats);
router.get('/users',                protect, authorize('admin'), getAllUsers);
router.get('/logs',                 protect, authorize('admin'), getActivityLogs);
router.post('/users',               protect, authorize('admin'), createUser);
router.patch('/users/:id/role',     protect, authorize('admin'), updateUserRole);
router.patch('/users/:id/reset-password', protect, authorize('admin'), adminResetPassword);
router.patch('/users/:id/block',    protect, authorize('admin', 'teacher'), toggleBlockUser);
router.delete('/users/:id',         protect, authorize('admin', 'teacher'), deleteUser);

// Teacher + admin shared utilities
router.get('/students/search',                  protect, authorize('teacher', 'admin'), searchStudents);
router.patch('/students/:id/reset-password',    protect, authorize('teacher', 'admin'), resetStudentPassword);

module.exports = router;
