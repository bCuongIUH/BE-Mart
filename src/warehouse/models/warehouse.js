
const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
    },
    entryDate: {
        type: Date,
        required: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier', 
        required: true,
    },
    sellingPrice: {
        type: Number,
        default: 0, 
    },
    status: {
        type: String,
        enum: ['in stock', 'on sale'], 
        default: 'in stock',
    },
    
}, { timestamps: true });

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);
module.exports = Warehouse;
