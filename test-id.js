require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    // Generate test
    const lastUser = await User.findOne({ studentId: /^LM\d+$/ })
      .sort({ studentId: -1 })
      .collation({ locale: 'en_US', numericOrdering: true });
    
    console.log("Last user:", lastUser ? lastUser.studentId : null);
    
    let nextId = 'LM101';
    if (lastUser && lastUser.studentId) {
      const lastNum = parseInt(lastUser.studentId.replace('LM', ''), 10);
      if (!isNaN(lastNum)) {
        nextId = `LM${lastNum + 1}`;
      }
    }
    console.log("Next ID:", nextId);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
