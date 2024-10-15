const mongoose = require('mongoose');

// Schema for the Price List (Bảng giá)
const PriceListSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true }, 
    description: { type: String, required: true }, 
    startDate: { type: Date, required: true }, 
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }, 
    createdAt: { type: Date, default: Date.now },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            price: { type: Number, required: true },
        }
    ]
}, { timestamps: true });


const PriceList = mongoose.model('PriceList', PriceListSchema);

module.exports = PriceList;
