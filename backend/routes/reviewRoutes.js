const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// POST /api/reviews/add - Add a review
router.post('/add', protect, async (req, res) => {
  try {
    const { workerId, rating, review } = req.body;

    // Validation
    if (!workerId || !rating || !review) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Create review
    const newReview = await Review.create({
      workerId,
      userId: req.user.id,
      rating,
      review,
    });

    // Update worker's average rating
    const allReviews = await Review.find({ workerId });
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Worker.findByIdAndUpdate(workerId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: allReviews.length,
    });

    res.status(201).json({
      message: 'Review added successfully',
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reviews/:workerId - Get all reviews for a worker
router.get('/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;

    // Check if worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Get all reviews with user details
    const reviews = await Review.find({ workerId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      workerId,
      averageRating: worker.averageRating,
      totalReviews: worker.totalReviews,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
