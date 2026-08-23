require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const dns = require('dns');

// Force IPv4 DNS resolution for MongoDB Atlas SRV issues
dns.setDefaultResultOrder('ipv4first');

// ── Initialize Express ───────────────────────────────────────────────────────
const app = express();
const mongoose = require('mongoose');

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected before handling any requests (Serverless Best Practice)
let dbConnectPromise = null;

app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  if (!dbConnectPromise) {
    dbConnectPromise = mongoose.connect(process.env.MONGO_URI, { 
      serverSelectionTimeoutMS: 5000,
      family: 4 
    }).then(conn => {
      console.log('✅ MongoDB Connected (Middleware)');
      return conn;
    }).catch(err => {
      dbConnectPromise = null; // reset to allow retries
      throw err;
    });
  }

  try {
    await dbConnectPromise;
    next();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    return res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));

app.use('/api/payments',  require('./routes/paymentRoutes'));
app.use('/api/results',   require('./routes/resultRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/proxy',     require('./routes/proxyRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/live-classes', require('./routes/liveClassRoutes'));
app.use('/api/system',    require('./routes/systemRoutes'));
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
