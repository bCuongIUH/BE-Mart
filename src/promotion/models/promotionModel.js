const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
        code: { type: String, unique: true, required: true }, 
        description: { type: String, required: true },  
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },  
    conditions: [{
        discountValue: { type: Number, required: true }, //20% giảm tiền
        minimumAmount: { type: Number, required: true },  
        maxDiscount: { type: Number, required: true },  
        applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], 
       
        applyToAllProducts: { type: Boolean, default: false },  
        startDate: { type: Date, required: true },  
        endDate: { type: Date, required: true }  
    }]
}, { timestamps: true });

const Promotion = mongoose.model('Promotion', PromotionSchema);

module.exports = Promotion;
