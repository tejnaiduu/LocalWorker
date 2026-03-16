const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// Create a booking (customer)
router.post('/', protect, async (req, res) => {
  try {
    const { workerId, serviceDetails, scheduledDate } = req.body;

    if (!workerId || !serviceDetails || !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Verify worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ 
        success: false, 
        message: 'Worker not found' 
      });
    }

    const booking = new Booking({
      customerId: req.user.id,
      workerId,
      serviceDetails,
      scheduledDate: new Date(scheduledDate),
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all bookings for a user (customer or worker)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // If worker, show bookings for them; if customer, show their bookings
    const worker = await Worker.findOne({ userId: req.user.id });
    if (worker) {
      query.workerId = worker._id;
    } else {
      query.customerId = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email')
      .populate('workerId', 'name skill averageRating totalReviews')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('workerId', 'name skill experience location averageRating totalReviews');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update booking status (worker accepts/completes, customer cancels)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['requested', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: requested, accepted, rejected, completed, or cancelled',
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Workers can only update to accepted, rejected, or completed
    // Customers can cancel (change to cancelled)
    const worker = await Worker.findOne({ userId: req.user.id });
    if (worker && worker._id.toString() === booking.workerId.toString()) {
      if (!['accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Workers can only accept, reject, or complete bookings',
        });
      }
    } else if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Cancel booking (customer only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
