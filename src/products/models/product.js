const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    barcode: { type: String, unique: true },
    name: { type: String, required: true , unique : true},
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: false },
    currentPrice: { type: Number, default: 0 },
    
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    units: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },

 
    
}, { timestamps: true });

const Product = mongoose.model('Products', ProductSchema);

module.exports = Product;