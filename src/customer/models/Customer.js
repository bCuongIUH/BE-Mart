const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    default: null, // Mặc định trống
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  addressLines: {
    houseNumber: { type: String, default: '' },
    ward: { type: String, default: '' },
    district: { type: String, default: '' },
    province: { type: String, default: '' },
  },
  isDeleted: {
    type: Boolean,
    default: false, 
  },
});

module.exports = mongoose.model('Customer', customerSchema);
