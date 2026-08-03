const LessonPack = require('../models/LessonPack');

/**
 * @desc   Create a new lesson pack
 * @route  POST /api/lesson-packs
 * @access Private (teacher)
 */
exports.createLessonPack = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary returns URL in path
    }
    
    const lessonPack = await LessonPack.create({
      title,
      description,
      price: price || 0,
      imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, lessonPack });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all lesson packs
 * @route  GET /api/lesson-packs
 * @access Private
 */
exports.getLessonPacks = async (req, res) => {
  try {
    const packs = await LessonPack.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: packs.length, packs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a lesson pack
 * @route  DELETE /api/lesson-packs/:id
 * @access Private (teacher)
 */
exports.deleteLessonPack = async (req, res) => {
  try {
    const pack = await LessonPack.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({ success: false, message: 'Lesson pack not found' });
    }
    
    // Optional: Could also add logic to delete associated materials/payments or prevent deletion if payments exist
    await pack.deleteOne();
    
    res.status(200).json({ success: true, message: 'Lesson pack deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a lesson pack
 * @route  PUT /api/lesson-packs/:id
 * @access Private (teacher)
 */
exports.updateLessonPack = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    let pack = await LessonPack.findById(req.params.id);
    
    if (!pack) {
      return res.status(404).json({ success: false, message: 'Lesson pack not found' });
    }

    pack.title = title || pack.title;
    pack.description = description !== undefined ? description : pack.description;
    pack.price = price !== undefined ? price : pack.price;
    
    if (req.file) {
      pack.imageUrl = req.file.path;
    }
    
    await pack.save();
    res.status(200).json({ success: true, lessonPack: pack });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
