const express = require('express');
const {
  createAnnouncement,
  getAnnouncements,
  markAsRead,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require login

router
  .route('/')
  .get(getAnnouncements)
  .post(authorize('teacher', 'admin'), createAnnouncement);

router
  .route('/:id')
  .delete(authorize('teacher', 'admin'), deleteAnnouncement);

router.put('/:id/read', markAsRead);

module.exports = router;
