const mongoose = require('mongoose');
const Payment = require('./server/models/Payment');
const LessonPack = require('./server/models/LessonPack');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const javaPack = await LessonPack.findOne({ title: /Java/i });
  const payment = await Payment.findOne({ lessonPackId: javaPack._id }).sort({ createdAt: -1 });
  console.log('--- JAVA PAYMENT ---');
  if (payment) {
    console.log('Status:', payment.status);
    console.log('Slip:', payment.slipImageUrl);
    console.log('Updated:', payment.updatedAt);
  }
  process.exit(0);
});
