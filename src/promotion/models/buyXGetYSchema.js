const mongoose = require('mongoose');

const buyXGetYSchema = new mongoose.Schema({
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
    conditions: [{
        productXId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantityX: { type: Number, required: true },
        productYId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantityY: { type: Number, required: true }
    }]
}, { timestamps: true });

const BuyXGetY = mongoose.model('BuyXGetY', buyXGetYSchema);

module.exports = BuyXGetY;
