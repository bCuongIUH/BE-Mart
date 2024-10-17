const mongoose = require('mongoose');

const fixedDiscountSchema = new mongoose.Schema({
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
    conditions: [{
        minOrderValue: { type: Number, required: true },
        discountAmount: { type: Number, required: true }
    }]
}, { timestamps: true });

const FixedDiscount = mongoose.model('FixedDiscount', fixedDiscountSchema);

module.exports = FixedDiscount;
