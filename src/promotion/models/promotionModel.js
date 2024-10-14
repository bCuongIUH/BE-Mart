const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
        code: { type: String, unique: true, required: true }, 
        description: { type: String, required: true },  
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },  
    conditions: [{
        discountValue: { type: Number, required: true },  // Giá trị khuyến mãi
        minimumAmount: { type: Number, required: true },  // Số tiền tối thiểu
        maxDiscount: { type: Number, required: true },  // Giảm giá tối đa
        applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],  // Sản phẩm áp dụng
        applyToAllProducts: { type: Boolean, default: false },  // Áp dụng tất cả sản phẩm
        startDate: { type: Date, required: true },  // Ngày bắt đầu
        endDate: { type: Date, required: true }  
    }]
}, { timestamps: true });

const Promotion = mongoose.model('Promotion', PromotionSchema);

module.exports = Promotion;
