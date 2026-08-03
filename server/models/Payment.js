const mongoose = require('mongoose');

/**
 * Payment Schema
 * A student uploads a bank slip image for a given month.
 * The teacher reviews and sets status to 'approved' or 'rejected'.
 * Approved payments unlock that month's materials for the student.
 */
const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the Lesson Pack this payment is for
    lessonPackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LessonPack',
      required: [true, 'Lesson Pack is required'],
    },
    // Cloudinary URL of the uploaded bank slip screenshot
    slipImageUrl: {
      type: String,
      required: [true, 'Slip image is required'],
    },
    slipImagePublicId: {
      type: String, // Cloudinary public_id for deletion
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Optional note from teacher on rejection
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index: one payment record per student per lesson pack
paymentSchema.index({ studentId: 1, lessonPackId: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
