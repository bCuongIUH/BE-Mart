const mongoose = require("mongoose");

const buyXGetYSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    conditions: [
      {
        productXId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantityX: { type: Number, required: true },
        unitX: { type: String, required: true }, // lon , thùng.....
        productYId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantityY: { type: Number, required: true },
        unitY: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const BuyXGetYVoucher = mongoose.model("BuyXGetYVoucher", buyXGetYSchema);

module.exports = BuyXGetYVoucher;
