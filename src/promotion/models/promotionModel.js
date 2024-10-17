const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

const PromotionHeader = mongoose.model('Promotion', promotionSchema);

module.exports = PromotionHeader;
