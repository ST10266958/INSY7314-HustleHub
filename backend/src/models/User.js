const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    // Account lockout state (see authController.login)
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
