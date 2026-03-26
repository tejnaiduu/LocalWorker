// FILE: backend/routes/debugRoutes.js
// Temporary debugging endpoints - REMOVE BEFORE PRODUCTION

const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const authorizeAdmin = require('../middleware/adminAuth');

// DEBUG: Get all workers with full data
router.get('/check/all-workers', protect, authorizeAdmin, async (req, res) => {
  try {
    const workers = await Worker.find({}).populate('userId', 'name email phone role');
    
    console.log('\n=== ALL WORKERS IN DATABASE ===');
    console.log(`Total workers: ${workers.length}`);
    workers.forEach((w, idx) => {
      console.log(`\n[Worker ${idx + 1}]`);
      console.log(`  _id: ${w._id}`);
      console.log(`  userId: ${w.userId?._id}`);
      console.log(`  userName: ${w.userId?.name}`);
      console.log(`  idProof: ${w.idProof}`);
      console.log(`  idProofApproved: ${w.idProofApproved}`);
      console.log(`  profileCompleted: ${w.profileCompleted}`);
    });
    
    res.json({
      success: true,
      totalWorkers: workers.length,
      workers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DEBUG: Get pending ID proofs with current logic
router.get('/check/pending-proofs', protect, authorizeAdmin, async (req, res) => {
  try {
    console.log('\n=== CHECKING PENDING ID PROOFS ===');
    
    // Test 1: Without populate
    const workersNoPopulate = await Worker.find({
      idProof: { $ne: null },
      idProofApproved: false,
    });
    
    console.log(`Found ${workersNoPopulate.length} workers with pending ID proofs (no populate)`);
    
    // Test 2: With populate
    const workersWithPopulate = await Worker.find({
      idProof: { $ne: null },
      idProofApproved: false,
    }).populate('userId', 'name email phone');
    
    console.log(`Found ${workersWithPopulate.length} workers with pending ID proofs (with populate)`);
    
    workersWithPopulate.forEach((w, idx) => {
      console.log(`\n[Pending ${idx + 1}]`);
      console.log(`  Worker ID: ${w._id}`);
      console.log(`  User Name: ${w.userId?.name}`);
      console.log(`  User Email: ${w.userId?.email}`);
      console.log(`  ID Proof File: ${w.idProof}`);
    });
    
    res.json({
      success: true,
      pendingCount: workersWithPopulate.length,
      workers: workersWithPopulate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DEBUG: Get specific worker by ID
router.get('/check/worker/:workerId', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId).populate('userId', 'name email phone');
    
    if (!worker) {
      return res.json({ success: false, message: 'Worker not found' });
    }
    
    console.log('\n=== WORKER DETAILS ===');
    console.log(JSON.stringify(worker, null, 2));
    
    res.json({
      success: true,
      worker
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DEBUG: Check admin auth middleware
router.get('/check/auth', protect, authorizeAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Admin auth is working',
    user: req.user
  });
});

module.exports = router;
