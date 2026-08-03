const mongoose = require('mongoose');

/**
 * Result Schema
 * Teachers enter or update a student's exam marks.
 * A student can have multiple results (one per exam).
 */
const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    // Optional grade label, e.g. 'A+', 'B'
    grade: {
      type: String,
      default: '',
    },
    month: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
