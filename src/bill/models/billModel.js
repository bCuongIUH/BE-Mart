const mongoose = require('mongoose');
const billSchema = new mongoose.Schema({
  billCode: { type: String },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      currentPrice: { type: Number, required: true },
      unit: { type: String, required: true },
    }
  ],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, required: false, default: 0 },

  status: { 
    type: String, 
    enum: ['HoanThanh', 'HoanTra', 'Canceled'], 
    default: 'HoanThanh' 
  },
  appliedVouchers: [
    {
      code: { type: String, required: true },
      type: { type: String, enum: ['BuyXGetY', 'FixedDiscount', 'PercentageDiscount'], required: true },
    }
  ],
  giftItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
    }
  ],
  paymentMethod: { type: String, enum: ['Cash', 'Card'], required: true },
  phoneNumber: { type: String, required: false },
  purchaseType: { type: String, enum: ['Online', 'Offline'], required: true },
  createBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeManagement', required: false },
  createdAt: { type: Date, default: Date.now },
});
billSchema.pre('save', function (next) {
  if (!this.billCode) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    this.billCode = `HĐB-${yyyy}-${mm}-${dd} ${randomNumber}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);