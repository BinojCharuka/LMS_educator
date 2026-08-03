const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details, req) => {
  try {
    let ipAddress = '';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    }
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Activity logging failed:', err.message);
  }
};

module.exports = { logActivity };
