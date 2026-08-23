const express = require('express');
const router = express.Router();
const { getMetrics, resetData } = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/auth');

// Both routes are protected and only accessible by teachers
router.get('/metrics', protect, authorize('teacher'), getMetrics);
router.post('/reset', protect, authorize('teacher'), resetData);

module.exports = router;
