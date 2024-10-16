const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    code: { type: String, unique: true },
    type: {
        type: String,
        enum: ['fixed_discount', 'percentage_discount', 'buy_x_get_y'],
        required: true
    },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
