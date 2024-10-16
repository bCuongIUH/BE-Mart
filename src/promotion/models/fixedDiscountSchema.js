const mongoose = require('mongoose');

const fixedDiscountSchema = new mongoose.Schema({
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
    discountAmount: { type: Number, required: true }
});

const FixedDiscount = mongoose.model('FixedDiscount', fixedDiscountSchema);
module.exports = FixedDiscount;