const express = require('express');
const {
  startLiveClass,
  getActiveLiveClasses,
  endLiveClass,
} = require('../controllers/liveClassController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require login

router.post('/start', authorize('teacher', 'admin'), startLiveClass);
router.get('/active', getActiveLiveClasses);
router.put('/:id/end', authorize('teacher', 'admin'), endLiveClass);

module.exports = router;
