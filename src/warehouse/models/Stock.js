const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true
    },
 
    lastUpdated: {
        type: Date,
        default: Date.now
    }
    
});

const Stock = mongoose.model('Stock', StockSchema);
module.exports = Stock;
