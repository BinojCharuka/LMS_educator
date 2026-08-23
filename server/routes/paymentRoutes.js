const express = require('express');
const router = express.Router();
const {
  uploadPayment,
  getMyPayments,
  getAllPayments,
  updatePaymentStatus,
  verifyPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSlip } = require('../middleware/upload');

// Student routes
router.post('/', protect, authorize('student'), uploadSlip.single('slip'), uploadPayment);
router.post('/:id/verify', protect, authorize('student'), verifyPayment);
router.get('/my', protect, authorize('student'), getMyPayments);

// Teacher routes
router.get('/',             protect, authorize('teacher'), getAllPayments);
router.patch('/:id/status', protect, authorize('teacher'), updatePaymentStatus);

module.exports = router;
