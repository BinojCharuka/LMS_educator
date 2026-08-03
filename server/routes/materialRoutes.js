const express = require('express');
const router = express.Router();
const {
  createMaterial,
  getMaterials,
  getStudentMaterials,
  getPreviewMaterials,
  updateMaterial,
  deleteMaterial,
  getRecentStudentMaterials,
  createMuxUpload,
  checkMuxUploadStatus,
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMaterial } = require('../middleware/upload');

// Authenticated routes — order matters (specific before :id)
router.get('/student/recent', protect, authorize('student'), getRecentStudentMaterials);
router.get('/student',  protect, authorize('student'), getStudentMaterials);
router.get('/preview/:lessonPackId', protect, getPreviewMaterials);

// Mux Upload endpoints
router.post('/mux-upload-url', protect, authorize('teacher'), createMuxUpload);
router.get('/mux-status/:uploadId', protect, authorize('teacher'), checkMuxUploadStatus);

router.get('/',    protect, authorize('teacher', 'admin'), getMaterials);
router.post('/',   protect, authorize('teacher'), uploadMaterial.single('file'), createMaterial);

router.put('/:id',    protect, authorize('teacher'), uploadMaterial.single('file'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;
