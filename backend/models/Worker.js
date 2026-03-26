const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      default: null,
      validate: {
        validator: function(v) {
          // Only validate if phone is provided
          if (!v) return true;
          // Accept phone numbers with digits, spaces, hyphens, plus, brackets
          return /^[\d\s\-\+\(\)]+$/.test(v) && v.length >= 7;
        },
        message: 'Please provide a valid phone number (at least 7 digits)',
      },
    },
    skill: {
      type: String,
      enum: ['plumber', 'electrician', 'carpenter'],
      default: null,
    },
    experience: {
      type: Number,
      min: 0,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Note: idProofUrl is unused. Use 'idProof' field instead.
    idProofUrl: {
      type: String,
      default: null,
      deprecated: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    idProof: {
      type: String,
      default: null,
      trim: true,
    },
    idProofApproved: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
