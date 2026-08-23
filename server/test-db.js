const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find();
  console.log('--- ALL USERS ---');
  for (const user of users) {
    console.log(user.email, user.role);
  }
  process.exit(0);
});
