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
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create default admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new Admin({
        username: 'admin',
        email: 'admin@richtymluxe.com',
        password: hashedPassword,
        fullName: 'Administrator',
        role: 'superadmin'
      });
      
      await admin.save();
      console.log('Admin user created successfully');
      console.log('Username: admin');
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
  
  process.exit();
};

seedAdmin();
