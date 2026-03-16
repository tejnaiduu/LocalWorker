const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// Create a rating (customer rates worker after booking completion)
router.post('/', protect, async (req, res) => {
  try {
    const { workerId, bookingId, stars, review } = req.body;

    if (!workerId || !bookingId || !stars) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workerId, bookingId, and stars',
      });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: 'Stars must be between 1 and 5',
      });
    }

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer of this booking can rate',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be completed before rating',
      });
    }

    // Check if rating already exists for this booking
    const existingRating = await Rating.findOne({ bookingId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this booking',
      });
    }

    const rating = new Rating({
      customerId: req.user.id,
      workerId,
      bookingId,
      stars,
      review: review || '',
    });

    await rating.save();

    // Update worker's average rating and review count
    const allRatings = await Rating.find({ workerId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;
    
    await Worker.findByIdAndUpdate(workerId, {
      averageRating: avgRating,
      totalReviews: allRatings.length,
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all ratings for a worker (public - no customer details shown)
router.get('/worker/:workerId', async (req, res) => {
  try {
    const ratings = await Rating.find({ workerId: req.params.workerId })
      .select('stars review createdAt')
      .sort({ createdAt: -1 });

    const worker = await Worker.findById(req.params.workerId)
      .select('averageRating totalReviews name skill');

    res.status(200).json({
      success: true,
      worker,
      ratings,
      count: ratings.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all ratings given by current customer
router.get('/customer/my-ratings', protect, async (req, res) => {
  try {
    const ratings = await Rating.find({ customerId: req.user.id })
      .populate('workerId', 'name skill')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      ratings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update a rating (customer only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { stars, review } = req.body;

    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }

    if (rating.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rating',
      });
    }

    if (stars && (stars < 1 || stars > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Stars must be between 1 and 5',
      });
    }

    if (stars) rating.stars = stars;
    if (review) rating.review = review;

    await rating.save();

    // Recalculate worker's average
    const allRatings = await Rating.find({ workerId: rating.workerId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;
    
    await Worker.findByIdAndUpdate(rating.workerId, {
      averageRating: avgRating,
    });

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      rating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete a rating (customer only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }

    if (rating.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rating',
      });
    }

    await Rating.findByIdAndDelete(req.params.id);

    // Recalculate worker's average
    const allRatings = await Rating.find({ workerId: rating.workerId });
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length 
      : 0;
    
    await Worker.findByIdAndUpdate(rating.workerId, {
      averageRating: avgRating,
      totalReviews: allRatings.length,
    });

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
