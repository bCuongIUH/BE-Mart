// const mongoose = require('mongoose');

// const billSchema = new mongoose.Schema({
//   billCode: { type: String }, // Mã hóa đơn, sẽ thay đổi theo status
//   customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
//   items: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//       quantity: { type: Number, required: true },
//       currentPrice: { type: Number, required: true },
//       unit: { type: String, required: true },
//     }
//   ],
//   totalAmount: { type: Number, required: true },
//   discountAmount: { type: Number, default: 0 },
//   status: { 
//     type: String, 
//     enum: ['HoanThanh', 'HoanTra', 'Canceled','DangXuLy'], 
//     default: 'HoanThanh' 
//   },
//   appliedVouchers: [
//     {
//       code: { type: String },
//       type: { type: String, enum: ['BuyXGetY', 'FixedDiscount', 'PercentageDiscount'] },
//     }
//   ],
//   giftItems: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//       quantity: { type: Number },
//       unit: { type: String },
//     }
//   ],
//   paymentMethod: { type: String, enum: ['Cash', 'Card', 'ZaloPay'], required: true },
//   phoneNumber: { type: String },
//   purchaseType: { type: String, enum: ['Online', 'Offline'], required: true },
//   createBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeManagement' },
//   createdAt: { type: Date, default: Date.now },
//   isDeleted: { type: Boolean, default: false },
// });

// // Middleware để tạo hoặc cập nhật billCode
// billSchema.pre('save', function (next) {
//   const now = new Date();
//   const yyyy = now.getFullYear();
//   const mm = String(now.getMonth() + 1).padStart(2, '0');
//   const dd = String(now.getDate()).padStart(2, '0');
//   const randomNumber = Math.floor(1000 + Math.random() * 9000);

//   // Tạo mã hóa đơn dựa trên trạng thái
//   if (this.status === 'HoanTra') {
//     this.billCode = `HĐT-${yyyy}-${mm}-${dd}-${randomNumber}`;
//   } else if (this.status === 'HoanThanh') {
//     this.billCode = `HĐB-${yyyy}-${mm}-${dd}-${randomNumber}`;
//   } else if (this.status === 'Canceled') {
//     this.billCode = `HĐC-${yyyy}-${mm}-${dd}-${randomNumber}`;
//   }

//   next();
// });

// module.exports = mongoose.model('Bill', billSchema);
const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  billCode: { type: String }, // Mã hóa đơn, sẽ thay đổi theo status
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      currentPrice: { type: Number, required: true },
      unit: { type: String, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["HoanThanh", "HoanTra", "Canceled", "DangXuLy", "ChuaThanhToan", "KiemHang"],
    default: "HoanThanh",
  },
  appliedVouchers: [
    {
      code: { type: String },
      type: {
        type: String,
        enum: ["BuyXGetY", "FixedDiscount", "PercentageDiscount"],
      },
    },
  ],
  giftItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
      unit: { type: String },
    },
  ],
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card", "BankTransfer"],
    required: true,
  },
  phoneNumber: { type: String },
  orderCode: { type: String },
  purchaseType: { type: String, enum: ["Online", "Offline"], required: true },
  createBy: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeManagement" },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

// Middleware để tạo hoặc cập nhật billCode
billSchema.pre("save", function (next) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  // Tạo mã hóa đơn dựa trên trạng thái
  if (this.status === "HoanTra") {
    this.billCode = `HĐT-${yyyy}-${mm}-${dd}-${randomNumber}`;
  } else if (this.status === "HoanThanh") {
    this.billCode = `HĐB-${yyyy}-${mm}-${dd}-${randomNumber}`;
  } else if (this.status === "Canceled") {
    this.billCode = `HĐC-${yyyy}-${mm}-${dd}-${randomNumber}`;
  }
  else if (this.status === "ChuaThanhToan") {
    this.billCode = `HĐC-${yyyy}-${mm}-${dd}-${randomNumber}`;
  }

  next();
});

module.exports = mongoose.model("Bill", billSchema);
