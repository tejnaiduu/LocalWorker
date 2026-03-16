const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate ratings per booking
ratingSchema.index({ workerId: 1, bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
