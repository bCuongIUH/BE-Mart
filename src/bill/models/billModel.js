const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer' 
  
  },
  items: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
      },
      quantity: { 
        type: Number, 
        required: true 
      },
      currentPrice: { 
        type: Number, 
        required: true 
      },
      totalPrice: { 
        type: Number, 
        required: false 
      },
      unit: { 
        type: String,
        required: true,
      },
  
    },
  ],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Canceled'], 
    default: 'Pending' 
  },
  // changeAmount: { // Tiền thừa trả lại khách
  //   type: Number,
  //   required: false,
  //   default: 0
  // },
   appliedVoucher: { // ID chương trình khuyến mãi áp dụng
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: false},
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Card'], 
    required: true 
  },
  phoneNumber: {  
    type: String,
    required: false, 
  },
  purchaseType: {
    type: String,
    enum: ['Online', 'Offline'],  
    required: true 
  },
   createBy: { type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmployeeManagement', 
    required: false  },
});

module.exports = mongoose.model('Bill', billSchema);

