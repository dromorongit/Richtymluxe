require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();
  
  try {
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'AdminRichtymluxe' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create admin with specified credentials
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('2gABCD2026@#off', salt);
      
      const admin = new Admin({
        username: 'AdminRichtymluxe',
        email: 'admin@richtymluxe.com',
        password: hashedPassword,
        fullName: 'Richtymluxe Administrator',
        role: 'superadmin'
      });
      
      await admin.save();
      console.log('Admin user created successfully');
      console.log('Username: AdminRichtymluxe');
      console.log('Password: 2gABCD2026@#off');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
  
  process.exit();
};

seedAdmin();
