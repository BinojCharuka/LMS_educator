const express = require('express');
const {
  createLessonPack,
  getLessonPacks,
  deleteLessonPack,
  updateLessonPack,
} = require('../controllers/lessonPackController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCourseImage } = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All routes require login

router.post('/', authorize('teacher', 'admin'), uploadCourseImage.single('image'), createLessonPack);
router.get('/', getLessonPacks);
router.put('/:id', authorize('teacher', 'admin'), uploadCourseImage.single('image'), updateLessonPack);
router.delete('/:id', authorize('teacher', 'admin'), deleteLessonPack);

module.exports = router;
