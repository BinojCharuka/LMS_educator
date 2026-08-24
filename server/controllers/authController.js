const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../middleware/logger');
const cloudinary = require('../config/cloudinary');

// ── Helper: Sign JWT ─────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      studentId: user.studentId,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────

// generate a sequential student id like LM101, LM102
const generateStudentId = async () => {
  // Find the user with the highest studentId that starts with LM
  const lastUser = await User.findOne({ studentId: /^LM\d+$/ })
    .sort({ studentId: -1 })
    .collation({ locale: 'en_US', numericOrdering: true });
    
  let nextId = 'LM101';
  if (lastUser && lastUser.studentId) {
    const lastNum = parseInt(lastUser.studentId.replace('LM', ''), 10);
    if (!isNaN(lastNum)) {
      nextId = `LM${lastNum + 1}`;
    }
  }
  return nextId;
};

/**
 * @desc   Register a new student (public)
 * @route  POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const studentId = await generateStudentId();

    // New users always register as students
    const user = await User.create({ name, email, password, role: 'student', studentId });
    await logActivity(user._id, 'Register', `Account registered: student ${name} (${email})`, req);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Login any role
 * @route  POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // .select('+password') because password has select: false in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account is blocked. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await logActivity(user._id, 'Login', `User ${user.name} logged in successfully`, req);
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get currently logged in user
 * @route  GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update currently logged in user profile
 * @route  PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = password;

    // Handle profile image upload
    if (req.file) {
      // If user already has a profile image stored in Cloudinary, delete it
      if (user.profileImage && user.profileImage.includes('res.cloudinary.com')) {
        try {
          const urlParts = user.profileImage.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `educator/profiles/${filename.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Failed to delete old profile image from Cloudinary:', err);
        }
      }
      // Save new image URL
      user.profileImage = req.file.path;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
