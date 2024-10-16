const mongoose = require('mongoose');

const percentageDiscountSchema = new mongoose.Schema({
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
    discountPercentage: { type: Number, required: true },
    maxDiscountAmount: { type: Number } // Tùy chọn giới hạn tối đa số tiền giảm
});

const PercentageDiscount = mongoose.model('PercentageDiscount', percentageDiscountSchema);
module.exports = PercentageDiscount;