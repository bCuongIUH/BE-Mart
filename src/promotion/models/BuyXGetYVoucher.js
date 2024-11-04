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
        unitX: { type: String, required: true }, // Thêm đơn vị cho sản phẩm X
        productYId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantityY: { type: Number, required: true },
        unitY: { type: String, required: true }, // Thêm đơn vị cho sản phẩm Y
      },
    ],
  },
  { timestamps: true }
);

const BuyXGetYVoucher = mongoose.model("BuyXGetYVoucher", buyXGetYSchema);

module.exports = BuyXGetYVoucher;
