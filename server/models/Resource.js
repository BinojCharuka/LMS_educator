const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Note', 'Paper', 'Past Paper', 'Other'],
      required: [true, 'Resource category is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
