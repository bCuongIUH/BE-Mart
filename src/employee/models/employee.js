const mongoose = require('mongoose');

const employeeManagementSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  MaNV: { 
    type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
 
  addressLines: {
    houseNumber: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
  },

  gender: {
    type: String,
    enum: ['Nam', 'Nữ'], 
    required: false, 
  },

  dateOfBirth: {
    type: Date,
    required: false, 
  },

  additionalInfo: {
    type: String,
  },
  email: {
    type: String,
    required: false,
  },
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true
    },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  oldEmail: {
    type: String, 
  },
});

module.exports = mongoose.model('EmployeeManagement', employeeManagementSchema);
