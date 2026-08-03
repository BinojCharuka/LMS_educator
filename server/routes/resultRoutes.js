const express = require('express');
const router = express.Router();
const {
  createResult,
  getAllResults,
  getMyResults,
  updateResult,
  deleteResult,
} = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

// Student self-view
router.get('/my', protect, authorize('student'), getMyResults);

// Teacher & admin
router.get('/',    protect, authorize('teacher', 'admin'), getAllResults);
router.post('/',   protect, authorize('teacher'), createResult);
router.put('/:id', protect, authorize('teacher'), updateResult);
router.delete('/:id', protect, authorize('teacher'), deleteResult);

module.exports = router;
