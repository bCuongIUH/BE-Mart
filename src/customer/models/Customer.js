// const mongoose = require('mongoose');

// const customerSchema = new mongoose.Schema({
//   CustomerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', 
//     required: true,
//   },
//   fullName: {
//     type: String,
//     required: true,
//   },
//   dateOfBirth: {
//     type: Date,
//     default: null, // Mặc định trống
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   phoneNumber: {
//     type: String,
//     required: true,
//   },
//   joinDate: {
//     type: Date,
//     default: Date.now,
//   },
//   addressLines: {
//     houseNumber: { type: String, default: '' },
//     ward: { type: String, default: '' },
//     district: { type: String, default: '' },
//     province: { type: String, default: '' },
//   },
//   isDeleted: {
//     type: Boolean,
//     default: false, 
//   },
// });

// module.exports = mongoose.model('Customer', customerSchema);


const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
  CustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null, // Ban đầu có thể chưa có tài khoản
  },
  fullName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  email: {
    type: String,
    default: '', // Có thể không có email nếu chưa đăng ký tài khoản
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
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
  isRegistered: {
    type: Boolean,
    default: false, // Ban đầu là khách hàng chưa đăng ký tài khoản
  },
});

module.exports = mongoose.model('Customer', customerSchema);
