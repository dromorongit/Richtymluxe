const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { protect, generateToken } = require('../middleware/authMiddleware');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register new admin (only superadmin can do this)
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
router.post('/register', protect, async (req, res) => {
  try {
    // Check if current admin is superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can create new admins' });
    }

    const { username, email, password, fullName, role } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({
      username,
      email,
      password,
      fullName,
      role: role || 'admin'
    });

    const createdAdmin = await admin.save();

    res.status(201).json({
      _id: createdAdmin._id,
      username: createdAdmin.username,
      email: createdAdmin.email,
      fullName: createdAdmin.fullName,
      role: createdAdmin.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.fullName = req.body.fullName || admin.fullName;
    admin.email = req.body.email || admin.email;

    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      username: updatedAdmin.username,
      email: updatedAdmin.email,
      fullName: updatedAdmin.fullName,
      role: updatedAdmin.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
