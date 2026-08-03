const Announcement = require('../models/Announcement');

/**
 * @desc   Create announcement
 * @route  POST /api/announcements
 * @access Private (teacher, admin)
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      priority,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all announcements
 * @route  GET /api/announcements
 * @access Private
 */
exports.getAnnouncements = async (req, res) => {
  try {
    // If student, we can just return all or recent ones. We'll return all sorted by date.
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 announcements
      
    res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Mark announcement as read
 * @route  PUT /api/announcements/:id/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    // Add user to readBy array if not already present
    if (!announcement.readBy.includes(req.user._id)) {
      announcement.readBy.push(req.user._id);
      await announcement.save();
    }
    
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete an announcement
 * @route  DELETE /api/announcements/:id
 * @access Private (teacher, admin)
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
