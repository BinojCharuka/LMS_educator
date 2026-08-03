const express = require('express');
const router = express.Router();
const { createResource, getResources, deleteResource } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMaterial } = require('../middleware/upload');

router.get('/', protect, getResources);
router.post('/', protect, authorize('teacher', 'admin'), uploadMaterial.single('file'), createResource);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteResource);

module.exports = router;
