const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const User = require('../models/User');
const { protect, authorizeRole } = require('../middleware/auth');

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

    // Get all workers with coordinates
    let query = { latitude: { $ne: null }, longitude: { $ne: null } };
    
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

    const workers = await Worker.find({ skill })
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
    const workers = await Worker.find()
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

module.exports = router;

module.exports = router;
