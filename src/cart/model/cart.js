const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
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
  unit: { 
    type: String,
    required: true,
  },


});

const CartSchema = new mongoose.Schema({
  customer: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
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
  expiresAt: {  // Thêm trường expiresAt với TTL
    type: Date,
    default: () => Date.now() + 1 * 60 * 1000,  // 10 phút kể từ lúc tạo
    index: { expires: '1m' },
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
