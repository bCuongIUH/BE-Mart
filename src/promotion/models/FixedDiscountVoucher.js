const mongoose = require("mongoose");

const fixedDiscountSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    conditions: [
      {
        minOrderValue: { type: Number, required: true },
        discountAmount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const FixedDiscountVoucher = mongoose.model("FixedDiscountVoucher", fixedDiscountSchema);

module.exports = FixedDiscountVoucher;
