const LiveClass = require('../models/LiveClass');

/**
 * @desc   Start a new live class
 * @route  POST /api/live-classes
 * @access Private (teacher)
 */
exports.startLiveClass = async (req, res) => {
  try {
    const { title, link } = req.body;
    
    // First, end any currently active live classes by this teacher
    await LiveClass.updateMany(
      { createdBy: req.user._id, isActive: true },
      { isActive: false }
    );

    const liveClass = await LiveClass.create({
      title,
      link,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, liveClass });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get active live classes
 * @route  GET /api/live-classes/active
 * @access Private
 */
exports.getActiveLiveClasses = async (req, res) => {
  try {
    const activeClasses = await LiveClass.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: activeClasses.length, liveClasses: activeClasses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   End a live class
 * @route  PUT /api/live-classes/:id/end
 * @access Private (teacher)
 */
exports.endLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }
    
    liveClass.isActive = false;
    await liveClass.save();
    
    res.status(200).json({ success: true, message: 'Live class ended successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
