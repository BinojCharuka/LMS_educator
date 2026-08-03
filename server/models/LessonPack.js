const mongoose = require('mongoose');

const lessonPackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson pack title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('LessonPack', lessonPackSchema);
