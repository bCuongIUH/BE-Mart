const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    promotionProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromotionProgram", // Tham chiếu đến chương trình khuyến mãi
      required: true,
    },
    type: {
      type: String,
      enum: ["BuyXGetY", "FixedDiscount", "PercentageDiscount"], // Các loại voucher
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
