const mongoose = require('mongoose');

const WarehouseEntrySchema = new mongoose.Schema({
    entryCode: { type: String, required: true },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true }, 
    }]
}, { timestamps: true });

const WarehouseEntry = mongoose.model('WarehouseEntry', WarehouseEntrySchema);

module.exports =  WarehouseEntry ;