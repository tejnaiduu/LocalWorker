const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, profilePhoto, latitude, longitude } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide name, email, password and role' });
    }

    // For customer role, phone is required
    if ((role === 'customer' || role === 'admin') && !phone) {
      return res.status(400).json({ error: 'Phone number is required for customers and admins' });
    }

    // Validate role
    if (!['customer', 'worker', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be customer, worker, or admin' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || null, // Save phone for all roles including workers
      location: (role === 'customer' || role === 'admin') ? location : null,
      profilePhoto: role === 'customer' ? profilePhoto : null,
      latitude: (role === 'customer' || role === 'worker') ? latitude : null,
      longitude: (role === 'customer' || role === 'worker') ? longitude : null,
    });

    // If registering as worker, create a basic worker profile with coordinates
    if (role === 'worker') {
      await Worker.create({
        userId: user._id,
        skill: null, // Worker will complete profile later
        status: 'busy', // Default to busy initially
        latitude: latitude || 0,
        longitude: longitude || 0,
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check if user exists and get password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profilePhoto: user.profilePhoto,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me - Get current logged-in user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // If user is a worker, also get worker profile
    let worker = null;
    if (user.role === 'worker') {
      worker = await Worker.findOne({ userId: user._id });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profilePhoto: user.profilePhoto,
        latitude: user.latitude,
        longitude: user.longitude,
      },
      workerProfile: worker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile - Update customer profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, location, profilePhoto, latitude, longitude } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name || undefined,
        phone: phone || undefined,
        location: location || undefined,
        profilePhoto: profilePhoto || undefined,
        latitude: latitude !== undefined ? latitude : undefined,
        longitude: longitude !== undefined ? longitude : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profilePhoto: user.profilePhoto,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
