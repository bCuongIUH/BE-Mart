const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
    expires: 600,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  tempData: { 
    email: String,
    password: String,
    fullName: String,
    phoneNumber: String,
  },
});

module.exports = mongoose.model('OTP', otpSchema);
