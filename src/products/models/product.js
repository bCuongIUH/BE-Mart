const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  lines: [
    {
      supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      isAvailable: { type: Boolean, default: false },
    }
  ],
}, { timestamps: true });

const Product = mongoose.model('Products', ProductSchema);
module.exports = Product;
