const mongoose = require('mongoose');
const { login } = require('./controllers/authController');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const req = {
    body: {
      email: 'admin@educator.lms',
      password: 'Admin@1234'
    }
  };
  
  const res = {
    json: (data) => console.log('Response:', data),
    status: (code) => {
      console.log('Status:', code);
      return res;
    }
  };
  
  await login(req, res);
  process.exit(0);
});
