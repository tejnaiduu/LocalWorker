const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');
const authorizeAdmin = require('../middleware/adminAuth');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

// POST /api/admin/login - Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid credentials or not an admin' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', protect, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalWorkers = await Worker.countDocuments();
    const verifiedWorkers = await Worker.countDocuments({ verified: true });
    const pendingWorkers = await Worker.countDocuments({ verified: false });

    res.json({
      totalUsers,
      totalWorkers,
      verifiedWorkers,
      pendingWorkers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/workers/pending - Get pending workers for verification
router.get('/workers/pending', protect, authorizeAdmin, async (req, res) => {
  try {
    const pendingWorkers = await Worker.find({ verified: false })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(pendingWorkers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/workers/approve/:id - Approve a worker
router.put('/workers/approve/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({
      message: 'Worker approved successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/workers/reject/:id - Reject a worker
router.put('/workers/reject/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    await Worker.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(worker.userId);

    res.json({
      message: 'Worker rejected and deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/workers - Get all workers
router.get('/workers', protect, authorizeAdmin, async (req, res) => {
  try {
    const workers = await Worker.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/workers/:id - Delete a worker
router.delete('/workers/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    await Worker.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(worker.userId);

    res.json({
      message: 'Worker deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/idproofs/pending - Get pending ID proof uploads
router.get('/idproofs/pending', protect, authorizeAdmin, async (req, res) => {
  try {
    const workers = await Worker.find({
      idProof: { $ne: null },
      idProofApproved: false,
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/idproofs/:workerId/approve - Approve ID proof
router.put('/idproofs/:workerId/approve', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    if (!worker.idProof) {
      return res.status(400).json({ error: 'Worker has not uploaded an ID proof' });
    }

    worker.idProofApproved = true;
    await worker.save();

    res.json({
      success: true,
      message: 'ID proof approved successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/idproofs/:workerId/reject - Reject ID proof
router.put('/idproofs/:workerId/reject', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    if (!worker.idProof) {
      return res.status(400).json({ error: 'Worker has not uploaded an ID proof' });
    }

    // Delete file from filesystem if needed later
    worker.idProof = null;
    worker.idProofApproved = false;
    await worker.save();

    res.json({
      success: true,
      message: 'ID proof rejected and removed',
      worker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users - Get all customers
router.get('/users', protect, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete a customer
router.delete('/users/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'customer') {
      return res.status(400).json({ error: 'Can only delete customers' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
