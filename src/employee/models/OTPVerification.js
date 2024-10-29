const mongoose = require('mongoose');
const employee = require('./employee');
const { Schema } = mongoose;

const OTPVerificationSchema = new Schema({
    MaNV: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  addressLines: {
    houseNumber: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true }
  },
  otp: {
    type: String,
    required: true
  },
  otpExpires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Tự động xóa sau 10 phút (600 giây)
  }
});

module.exports = mongoose.model('OTPVerification', OTPVerificationSchema);
