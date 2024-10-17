const mongoose = require('mongoose');

const percentageDiscountSchema = new mongoose.Schema({
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
    conditions: [{
        minOrderValue: { type: Number, required: true },
        discountPercentage: { type: Number, required: true },
        maxDiscountAmount: { type: Number }
    }]
}, { timestamps: true });

const PercentageDiscount = mongoose.model('PercentageDiscount', percentageDiscountSchema);

module.exports = PercentageDiscount;
