require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./models/Admin');

const app = express();

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Make uploads folder accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

// Seed admin route (for initial setup - should be disabled in production)
app.post('/api/seed-admin', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    const existingAdmin = await Admin.findOne({ username: username || 'AdminRichtymluxe' });
    
    if (existingAdmin) {
      return res.json({ success: true, message: 'Admin user already exists' });
    }
    
    const admin = new Admin({
      username: username || 'AdminRichtymluxe',
      email: email || 'admin@richtymluxe.com',
      password: password || '2gABCD2026@#off',
      fullName: 'Richtymluxe Administrator',
      role: 'superadmin'
    });
    
    await admin.save();
    
    res.json({ 
      success: true, 
      message: 'Admin user created successfully',
      credentials: {
        username: admin.username,
        password: req.body.password || '2gABCD2026@#off'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    filePath: `/uploads/${req.file.filename}`
  });
});

// Upload multiple images
app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const filePaths = req.files.map(file => `/uploads/${file.filename}`);
  res.json({
    message: 'Files uploaded successfully',
    filePaths: filePaths
  });
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../')));

// Serve admin dashboard
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Admin dashboard route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Handle React/Vue router in production - serve index.html for any unknown routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/admin')) {
    res.sendFile(path.join(__dirname, '../index.html'));
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
