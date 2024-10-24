const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  items: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Products' 
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

      createBy: { type: String, required: false },
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
 
});

module.exports = mongoose.model('Bill', billSchema);

