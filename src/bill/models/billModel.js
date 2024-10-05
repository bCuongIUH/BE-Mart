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
      unitPrice: { 
        type: Number, 
        required: true 
      },
      totalPrice: { 
        type: Number, 
        required: true 
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
  }
});

module.exports = mongoose.model('Bill', billSchema);


// const mongoose = require('mongoose');

// const billSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
// },
//   items: [
//     {
//       product: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'Products' 
//     },
//       quantity: { 
//         type: Number, 
//         required: true 
//     },
//       unitPrice: { 
//         type: Number, 
//         required: true 
//     },
//       totalPrice: { 
//         type: Number, 
//         required: true 
//     },
//     },
//   ],
//   totalAmount: { 
//     type: Number, 
//     required: true 
// },
//   status: { 
//     type: String, 
//     enum: ['Pending', 'Paid', 'Canceled'], 
//     default: 'Pending' 
// },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
// },
//   paymentMethod: { 
//     type: String, 
//     enum: ['Cash', 'Card'], 
//     required: true 
// },
// });

// module.exports = mongoose.model('Bill', billSchema);