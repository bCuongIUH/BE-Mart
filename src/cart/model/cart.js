const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  // Thêm trường unit
  unit: {
    type: String,
    required: false,
  },
  unitValue: {
    type: Number,
    required: false,
  },

});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [CartItemSchema],
  status: {
    type: String,
    enum: ["ChoThanhToan", "DaMua", "Shipped", "HoanTra"],
    default: "ChoThanhToan",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
});

// Tự động cập nhật thời gian khi giỏ hàng được sửa đổi
CartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;
