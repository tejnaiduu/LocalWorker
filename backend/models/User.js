const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'customer', 'worker'],
      required: [true, 'Please select a role'],
    },
    // Customer profile fields
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
    location: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, 'Location cannot be more than 100 characters'],
    },
    profilePhoto: {
      type: String,
      default: null,
      trim: true,
      match: [
        /^https?:\/\/.+/,
        'Please provide a valid photo URL (must start with http:// or https://)',
      ],
      sparse: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
