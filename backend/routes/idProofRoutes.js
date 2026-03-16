const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');
const authorizeAdmin = require('../middleware/adminAuth');

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
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Upload ID proof (worker only)
router.post('/upload', protect, upload.single('idProof'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Get worker associated with this user
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found',
      });
    }

    // Remove old file if exists
    if (worker.idProof) {
      const oldFilePath = path.join(uploadDir, path.basename(worker.idProof));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Save file path to worker
    worker.idProof = req.file.filename;
    worker.idProofApproved = false; // Reset approval when new proof is uploaded
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'ID proof uploaded successfully. Awaiting admin approval.',
      filename: req.file.filename,
      worker,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get pending ID proof uploads (admin only)
router.get('/pending', protect, authorizeAdmin, async (req, res) => {
  try {
    const workers = await Worker.find({
      $or: [
        { idProof: { $ne: null }, idProofApproved: false },
      ],
    }).select('name skill phone location idProof verified createdAt');

    res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Approve ID proof (admin only)
router.put('/:workerId/approve', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    if (!worker.idProof) {
      return res.status(400).json({
        success: false,
        message: 'Worker has not uploaded an ID proof',
      });
    }

    worker.idProofApproved = true;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'ID proof approved successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Reject ID proof (admin only)
router.put('/:workerId/reject', protect, authorizeAdmin, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    if (!worker.idProof) {
      return res.status(400).json({
        success: false,
        message: 'Worker has not uploaded an ID proof',
      });
    }

    // Delete the file
    const filePath = path.join(uploadDir, worker.idProof);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    worker.idProof = null;
    worker.idProofApproved = false;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'ID proof rejected and removed',
      worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get ID proof file (for viewing)
router.get('/file/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
