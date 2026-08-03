const User = require('../models/User');
const Payment = require('../models/Payment');
const Material = require('../models/Material');
const Result = require('../models/Result');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../middleware/logger');

/**
 * @desc   Get system-wide statistics (admin overview)
 * @route  GET /api/admin/stats
 * @access Private (admin)
 */
exports.getStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalMaterials, totalPayments, pendingPayments] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        Material.countDocuments(),
        Payment.countDocuments(),
        Payment.countDocuments({ status: 'pending' }),
      ]);

    res.status(200).json({
      success: true,
      stats: { totalStudents, totalTeachers, totalMaterials, totalPayments, pendingPayments },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all users (admin view)
 * @route  GET /api/admin/users
 * @access Private (admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Block or unblock a user account
 * @route  PATCH /api/admin/users/:id/block
 * @access Private (admin)
 * @body   { isBlocked: boolean }
 */
exports.toggleBlockUser = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
    await logActivity(req.user._id, isBlocked ? 'Disable User' : 'Enable User', `${isBlocked ? 'Disabled' : 'Enabled'} user account: ${user.name} (${user.email})`, req);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a user and their associated data
 * @route  DELETE /api/admin/users/:id
 * @access Private (admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove user's data from related collections
    await Payment.deleteMany({ studentId: user._id });
    await Result.deleteMany({ studentId: user._id });

    const deletedUserName = user.name;
    const deletedUserEmail = user.email;
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User and all associated data deleted' });
    await logActivity(req.user._id, 'Delete User', `Deleted user account: ${deletedUserName} (${deletedUserEmail})`, req);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Search students by name or email (teacher utility)
 * @route  GET /api/admin/students/search?q=keyword
 * @access Private (teacher, admin)
 */
exports.searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    
    let filter = { role: 'student' };
    
    if (q) {
      filter.$or = [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const students = await User.find(filter).limit(50);

    res.status(200).json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Reset a student's password (teacher utility)
 * @route  PATCH /api/admin/students/:id/reset-password
 * @access Private (teacher, admin)
 * @body   { newPassword: string }
 */
exports.resetStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ _id: req.params.id, role: 'student' }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    user.password = newPassword; // Pre-save hook will hash it
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a new user (admin utility)
 * @route  POST /api/admin/users
 * @access Private (admin)
 * @body   { name, email, password, role }
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already in use' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Strip password from returned user object
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });
    await logActivity(req.user._id, 'Create User', `Created user account: ${name} (${email}) with role ${role}`, req);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a user's role (admin utility)
 * @route  PATCH /api/admin/users/:id/role
 * @access Private (admin)
 * @body   { role }
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
    await logActivity(req.user._id, 'Update Role', `Updated role of ${user.name} (${user.email}) from ${oldRole} to ${role}`, req);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Reset any user's password (admin utility)
 * @route  PATCH /api/admin/users/:id/reset-password
 * @access Private (admin)
 * @body   { newPassword }
 */
exports.adminResetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User password reset successfully'
    });
    await logActivity(req.user._id, 'Reset Password', `Reset password for user: ${user.name} (${user.email})`, req);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get activity logs (admin overview)
 * @route  GET /api/admin/logs
 * @access Private (admin)
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



