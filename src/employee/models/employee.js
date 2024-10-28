const mongoose = require('mongoose');

const employeeManagementSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
 
  address: {
    type: String,
    required: false, 
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
    required: true,
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
});

module.exports = mongoose.model('EmployeeManagement', employeeManagementSchema);
