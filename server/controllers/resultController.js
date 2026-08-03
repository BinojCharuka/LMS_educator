const Result = require('../models/Result');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @desc   Create a new result for a student
 * @route  POST /api/results
 * @access Private (teacher)
 */
exports.createResult = async (req, res) => {
  try {
    let { studentId, examName, marks, totalMarks, grade, month, remarks } = req.body;

    // Resolve string studentId (e.g., LM101) to MongoDB ObjectId
    if (studentId && !mongoose.Types.ObjectId.isValid(studentId)) {
      const user = await User.findOne({ studentId: studentId.trim() });
      if (!user) {
        return res.status(404).json({ success: false, message: `Student ID ${studentId} not found` });
      }
      studentId = user._id;
    }

    const result = await Result.create({
      studentId,
      examName,
      marks,
      totalMarks: totalMarks || 100,
      grade,
      month,
      remarks,
      enteredBy: req.user._id,
    });

    const populated = await result.populate('studentId', 'name email studentId');
    res.status(201).json({ success: true, result: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all results (teacher / admin view)
 * @route  GET /api/results
 * @access Private (teacher, admin)
 */
exports.getAllResults = async (req, res) => {
  try {
    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.month)     filter.month = req.query.month;

    const results = await Result.find(filter)
      .populate('studentId', 'name email studentId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get the logged-in student's own results
 * @route  GET /api/results/my
 * @access Private (student)
 */
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a result entry
 * @route  PUT /api/results/:id
 * @access Private (teacher)
 */
exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('studentId', 'name email studentId');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    res.status(200).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a result
 * @route  DELETE /api/results/:id
 * @access Private (teacher)
 */
exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.status(200).json({ success: true, message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
