const mongoose = require('mongoose');

// Kiểm tra xem model đã được định nghĩa chưa, nếu chưa thì định nghĩa
const PriceListSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true }, 
    description: { type: String, required: true }, 
    startDate: { type: Date, required: true }, 
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
            unitPrices: [
                {
                    unitDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'UnitDetail', required: true },
                    price: { type: Number, required: true } // Trường này phải có
                }
            ]
        }
    ]
}, { timestamps: true });

// Chỉ định nghĩa model một lần
const PriceListV2 = mongoose.model('PriceListV2', PriceListSchema);

module.exports = PriceListV2;
