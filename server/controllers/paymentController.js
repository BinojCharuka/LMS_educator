const Payment = require('../models/Payment');
const cloudinary = require('../config/cloudinary');

/**
 * @desc   Student uploads a bank slip for a specific month
 * @route  POST /api/payments
 * @access Private (student)
 */
exports.uploadPayment = async (req, res) => {
  try {
    const { lessonPackId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Slip image is required' });
    }

    // Handle existing submission for the same lesson pack
    const existing = await Payment.findOne({ studentId: req.user._id, lessonPackId });
    
    if (existing) {
      if (existing.status === 'rejected') {
        // Delete the old rejected slip image from cloudinary
        if (existing.slipImagePublicId) {
          try {
            await cloudinary.uploader.destroy(existing.slipImagePublicId);
          } catch (err) {
            console.error('Error deleting old slip image:', err);
          }
        }
        
        // Update the existing record with the new slip and set status to pending
        existing.slipImageUrl = req.file.path;
        existing.slipImagePublicId = req.file.filename;
        existing.status = 'pending';
        existing.rejectionReason = ''; // Clear any previous rejection reason
        await existing.save();
        
        return res.status(200).json({ success: true, payment: existing });
      } else {
        // If pending or approved, block the submission and delete the just-uploaded file
        await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({
          success: false,
          message: `Payment for this lesson pack already submitted (status: ${existing.status})`,
        });
      }
    }

    const payment = await Payment.create({
      studentId: req.user._id,
      lessonPackId,
      slipImageUrl: req.file.path,
      slipImagePublicId: req.file.filename,
      status: 'pending',
    });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get the logged-in student's own payment records
 * @route  GET /api/payments/my
 * @access Private (student)
 */
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user._id })
      .populate('lessonPackId', 'title price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get ALL payment records with student info (teacher view)
 * @route  GET /api/payments
 * @access Private (teacher)
 */
exports.getAllPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.lessonPackId) filter.lessonPackId = req.query.lessonPackId;

    const payments = await Payment.find(filter)
      .populate('studentId', 'name email avatar')
      .populate('lessonPackId', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Approve or reject a payment (teacher only)
 * @route  PATCH /api/payments/:id/status
 * @access Private (teacher)
 * @body   { status: 'approved' | 'rejected', rejectionReason?: string }
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason || '' : '',
      },
      { new: true }
    ).populate('studentId', 'name email').populate('lessonPackId', 'title');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
