const mongoose = require('mongoose');

const WarehouseEntrySchema = new mongoose.Schema({
    entryCode: { type: String, required: true },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lines: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        //unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true }
    }]
}, { timestamps: true });

const WarehouseEntry = mongoose.model('WarehouseEntry', WarehouseEntrySchema);

module.exports = WarehouseEntry;
