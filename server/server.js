require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

// ── Initialize Express ───────────────────────────────────────────────────────
const app = express();
connectDB();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));

// Temporary debug route
const mongoose = require('mongoose');
app.get('/api/debug-env', async (req, res) => {
  const uri = process.env.MONGO_URI;
  
  let dbStatus = 'disconnected';
  let dbError = null;
  
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    dbStatus = 'connected';
  } catch (err) {
    dbError = err.message;
  }

  res.json({
    hasMongoUri: !!uri,
    length: uri ? uri.length : 0,
    startsWithQuote: uri ? uri.startsWith('"') : false,
    dbStatus,
    dbError
  });
});
app.use('/api/payments',  require('./routes/paymentRoutes'));
app.use('/api/results',   require('./routes/resultRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/proxy',     require('./routes/proxyRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/live-classes', require('./routes/liveClassRoutes'));
app.use('/api/lesson-packs', require('./routes/lessonPackRoutes')); // <-- Added this

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Educator LMS Server running on port ${PORT}`);
  });
}

module.exports = app;
