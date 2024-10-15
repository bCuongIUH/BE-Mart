const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    barcode: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: false },
    currentPrice: { type: Number, default: 0 }, 

    lines: [{
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
        quantity: { type: Number, required: true, default: 0 },
        isAvailable: { type: Boolean, default: false },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date }
    }],

    priceLists: [{
        priceListId: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList', required: true },
        isActive: { type: Boolean, default: true } 
    }]
}, { timestamps: true });

const Product = mongoose.model('Products', ProductSchema);

module.exports = Product;