const mongoose = require('mongoose');

/**
 * Material Schema
 * Types:
 *   'pdf'       → Cloudinary URL to a PDF file
 *   'yt-video'  → YouTube unlisted video URL (will be embedded)
 *   'live-link' → External meeting link (Google Meet, Zoom, etc.)
 *
 * month: string label, e.g. "January 2025", used to gate student access.
 */
const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'yt-video', 'live-link', 'video'],
      required: [true, 'Material type is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    // Reference to the Lesson Pack this material belongs to
    lessonPackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LessonPack',
      required: [true, 'Lesson Pack is required'],
    },
    // Optional description shown to students
    description: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
