const express = require('express');
const router = express.Router();
const { getMetrics, resetData } = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/auth');

// Both routes are protected and accessible by teachers and admins
router.get('/metrics', protect, authorize('teacher', 'admin'), getMetrics);
router.post('/reset', protect, authorize('teacher', 'admin'), resetData);

module.exports = router;
