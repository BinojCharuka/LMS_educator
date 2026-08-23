const express = require('express');
const router = express.Router();
const { getMetrics, resetData } = require('../controllers/systemController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Both routes are protected and only accessible by teachers
router.get('/metrics', protect, authorizeRoles('teacher'), getMetrics);
router.post('/reset', protect, authorizeRoles('teacher'), resetData);

module.exports = router;
