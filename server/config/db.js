const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGO_URI from environment variables.
 * Exits the process on failure.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Drop legacy index studentId_1_month_1 if it exists
    try {
      await conn.connection.db.collection('payments').dropIndex('studentId_1_month_1');
      console.log('✅ Dropped legacy unique index studentId_1_month_1');
    } catch (err) {
      // Index might not exist or already be dropped, ignore this error
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
