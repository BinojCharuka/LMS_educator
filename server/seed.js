/**
 * Educator LMS — Database Seeder
 * 
 * Creates initial Admin and Teacher accounts.
 * Run once after setting up your .env file:
 *   node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const connectDB = require('./config/db');

const SEED_USERS = [
  {
    name:     'Educator Admin',
    email:    'admin@educator.lms',
    password: 'Admin@1234',
    role:     'admin',
  },
  {
    name:     'Mr. Suresh Jayawardena',
    email:    'teacher@educator.lms',
    password: 'Teacher@1234',
    role:     'teacher',
  },
  {
    // Sample student for testing
    name:     'Test Student',
    email:    'student@educator.lms',
    password: 'Student@1234',
    role:     'student',
  },
];

async function seed() {
  await connectDB();
  console.log('\n🌱 Starting Educator LMS seeder...\n');

  for (const userData of SEED_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⏭️  Skipped  [${userData.role}] ${userData.email} — already exists`);
      continue;
    }
    await User.create(userData);
    console.log(`✅ Created  [${userData.role}] ${userData.email}  (pass: ${userData.password})`);
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('─────────────────────────────────────');
  console.log('  Admin:    admin@educator.lms    / Admin@1234');
  console.log('  Teacher:  teacher@educator.lms  / Teacher@1234');
  console.log('  Student:  student@educator.lms  / Student@1234');
  console.log('─────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
