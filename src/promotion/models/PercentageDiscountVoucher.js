const mongoose = require("mongoose");

const percentageDiscountSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    conditions: [
      {
        minOrderValue: { type: Number, required: true ,},
        discountPercentage: { type: Number, required: true },
        maxDiscountAmount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

const PercentageDiscountVoucher = mongoose.model(
  "PercentageDiscountVoucher",
  percentageDiscountSchema
);

module.exports = PercentageDiscountVoucher;
