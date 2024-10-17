const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },

}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
