
const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    conversionValue: { type: Number, default: 1 },
    barcode: { type: String, unique: false, required: false },
    //image: { type: String }
    isdeleted: { type: Boolean, default: false }
}, {});


const ProductSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    isDeleted: { type: Boolean, default: false } ,
    isActive: { type: Boolean, default: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    baseUnit: UnitSchema,
    conversionUnits: [UnitSchema] 
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
