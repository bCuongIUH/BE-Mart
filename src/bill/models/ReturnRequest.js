const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true }, 
  reason: { type: String, required: true }, 
  images: [{ type: String }], 
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed', 'Rejected'], 
    default: 'Pending' 
  }, // Trạng thái yêu cầu
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
