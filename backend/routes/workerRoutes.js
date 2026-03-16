const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Worker = require('../models/Worker');
const User = require('../models/User');
const { protect, authorizeRole } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/idproofs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'idproof-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PNG are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// GET /api/workers/nearby - Get nearby workers (must be before /:id)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5, skill } = req.query;

    // Validation
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Please provide latitude and longitude',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Get all verified workers with coordinates
    let query = { 
      latitude: { $ne: null }, 
      longitude: { $ne: null },
      isVerified: true  // Only return verified workers
    };
    
    if (skill) {
      const validSkills = ['plumber', 'electrician', 'carpenter'];
      if (!validSkills.includes(skill)) {
        return res.status(400).json({ error: 'Invalid skill type' });
      }
      query.skill = skill;
    }

    const workers = await Worker.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Filter by distance using Haversine formula
    const nearbyWorkers = workers
      .map((worker) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          worker.latitude,
          worker.longitude
        );
        return { ...worker.toObject(), distance };
      })
      .filter((worker) => worker.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      searchLocation: { lat: latitude, lng: longitude },
      radius: searchRadius,
      count: nearbyWorkers.length,
      workers: nearbyWorkers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workers/skill/:skill - Filter workers by skill
router.get('/skill/:skill', async (req, res) => {
  try {
    const { skill } = req.params;

    // Validate skill
    const validSkills = ['plumber', 'electrician', 'carpenter'];
    if (!validSkills.includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill type' });
    }

    // Only return verified workers
    const workers = await Worker.find({ skill, isVerified: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workers/register - Register a new worker (protected)
router.post('/register', protect, async (req, res) => {
  try {
    const { phone, skill, experience, location, latitude, longitude } = req.body;

    // Check if user is authenticated
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user role is worker
    if (user.role !== 'worker') {
      return res.status(403).json({ error: 'Only workers can register as workers' });
    }

    // Validation - phone is optional
    if (!skill || experience === undefined || !location) {
      return res.status(400).json({ error: 'Skill, experience, and location are required' });
    }

    // Check if skill is valid
    const validSkills = ['plumber', 'electrician', 'carpenter'];
    if (!validSkills.includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill type' });
    }

    // Check if worker profile already exists
    const existingWorker = await Worker.findOne({ userId: user._id });
    if (existingWorker) {
      return res.status(400).json({ error: 'Worker profile already exists for this user' });
    }

    // Create new worker with phone if provided
    const newWorker = new Worker({
      userId: user._id,
      name: user.name,
      phone: phone || null,
      skill,
      experience,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
    });

    await newWorker.save();

    // Also sync phone to User model
    if (phone) {
      await User.findByIdAndUpdate(user._id, { phone });
    }

    res.status(201).json({
      message: 'Worker registered successfully',
      worker: newWorker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workers - Get all workers
router.get('/', async (req, res) => {
  try {
    // Only return verified workers to customers
    const workers = await Worker.find({ isVerified: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workers/:id - Get single worker by ID
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate(
      'userId',
      'name email'
    );
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/workers/status/:id - Update worker status
router.put('/status/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({ error: 'Please provide a status' });
    }

    const validStatus = ['available', 'busy'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Check if user is the owner of the worker profile
    if (worker.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'Not authorized to update this worker status' });
    }

    worker.status = status;
    await worker.save();

    res.json({
      message: 'Worker status updated successfully',
      worker: {
        name: worker.name,
        skill: worker.skill,
        status: worker.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/workers/:id - Update worker profile details (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, phone, skill, experience, location, latitude, longitude } = req.body;

    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Check if user is the owner of the worker profile
    if (worker.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'Not authorized to update this worker profile' });
    }

    // Update fields if provided
    if (name) worker.name = name;
    if (phone !== undefined) worker.phone = phone;
    if (skill) {
      const validSkills = ['plumber', 'electrician', 'carpenter'];
      if (!validSkills.includes(skill)) {
        return res.status(400).json({ error: 'Invalid skill type' });
      }
      worker.skill = skill;
    }
    if (experience !== undefined) worker.experience = experience;
    if (location) worker.location = location;
    if (latitude !== undefined) worker.latitude = latitude;
    if (longitude !== undefined) worker.longitude = longitude;

    await worker.save();

    // Also update the User model with phone, location, and coordinates
    const userUpdate = {};
    if (phone !== undefined) userUpdate.phone = phone;
    if (location) userUpdate.location = location;
    if (latitude !== undefined) userUpdate.latitude = latitude;
    if (longitude !== undefined) userUpdate.longitude = longitude;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(worker.userId, userUpdate);
    }

    res.json({
      message: 'Worker profile updated successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workers/complete-profile - Complete worker profile with ID proof (protected)
router.post('/complete-profile', protect, upload.single('idProof'), async (req, res) => {
  try {
    console.log('Complete profile request received');
    console.log('User ID:', req.user.id);
    console.log('File:', req.file ? req.file.filename : 'No file');
    console.log('Body:', req.body);

    const { skill, experience, location, latitude, longitude } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'worker') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Only workers can access this endpoint' });
    }

    // Get existing worker or create new one
    let worker = await Worker.findOne({ userId: req.user.id });
    
    if (!worker) {
      worker = new Worker({ userId: req.user.id });
    }

    // Validate and update fields
    if (!skill || experience === undefined || !location) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Skill, experience, and location are required' });
    }

    const validSkills = ['plumber', 'electrician', 'carpenter'];
    if (!validSkills.includes(skill)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid skill type' });
    }

    // Update worker profile
    worker.name = user.name;
    worker.phone = user.phone || null;
    worker.skill = skill;
    worker.experience = Number(experience);
    worker.location = location;
    worker.latitude = latitude ? Number(latitude) : null;
    worker.longitude = longitude ? Number(longitude) : null;
    worker.profileCompleted = true;

    // ID Proof is REQUIRED
    if (!req.file) {
      return res.status(400).json({ 
        error: 'ID Proof upload is required. Please upload a valid Aadhaar, PAN, or Driving License.' 
      });
    }

    // Handle file upload
    if (req.file) {
      // Remove old file if exists
      if (worker.idProof) {
        const oldFilePath = path.join(uploadDir, path.basename(worker.idProof));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      worker.idProof = req.file.filename;
      worker.idProofApproved = false; // Reset approval on new upload
      worker.isVerified = false; // Set to unverified until admin approves
    }

    await worker.save();

    // Update user model with location and coordinates
    const userUpdate = {
      location: location,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
    };
    await User.findByIdAndUpdate(req.user.id, userUpdate);

    res.status(200).json({
      message: 'Worker profile completed successfully',
      worker,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workers/verification-status - Get worker verification status (protected)
router.get('/verification-status', protect, async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });

    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    res.json({
      profileCompleted: worker.profileCompleted,
      isVerified: worker.isVerified,
      idProofApproved: worker.idProofApproved,
      worker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
