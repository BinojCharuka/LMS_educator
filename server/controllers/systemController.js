const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const Payment = require('../models/Payment');

/**
 * @desc    Get system storage metrics (MongoDB & Cloudinary)
 * @route   GET /api/system/metrics
 * @access  Private/Teacher
 */
exports.getMetrics = async (req, res) => {
  try {
    // 1. MongoDB Storage
    const dbStats = await mongoose.connection.db.stats();
    const mongoSizeBytes = dbStats.dataSize + dbStats.indexSize;

    // 2. Cloudinary Storage
    let cloudinaryUsageBytes = 0;
    let cloudinaryLimitBytes = 0;
    
    try {
      const usage = await cloudinary.api.usage();
      cloudinaryUsageBytes = usage.storage.usage;
      cloudinaryLimitBytes = usage.storage.limit;
    } catch (cErr) {
      console.error('Failed to fetch Cloudinary usage:', cErr);
    }

    res.status(200).json({
      success: true,
      mongoSizeBytes,
      cloudinaryUsageBytes,
      cloudinaryLimitBytes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Reset student data (Deletes all students, payments, and slip images)
 * @route   POST /api/system/reset
 * @access  Private/Teacher
 */
exports.resetData = async (req, res) => {
  try {
    // 1. Delete all slip images from Cloudinary (in 'educator/slips' folder)
    try {
      await cloudinary.api.delete_resources_by_prefix('educator/slips/');
    } catch (cErr) {
      console.error('Failed to delete Cloudinary resources:', cErr);
    }

    // 2. Delete all payments
    await Payment.deleteMany({});

    // 3. Delete all students
    await User.deleteMany({ role: 'student' });

    res.status(200).json({ success: true, message: 'All student data and payments have been successfully reset.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
