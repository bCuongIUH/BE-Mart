const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    transactionType: {
        type: String,
        enum: ['nhap', 'ban', 'huy', 'kiemke', 'khuyenmai', 'hoantra'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    adjustmentType: {  // Thêm loại điều chỉnh
        type: String,
        enum: ['increase', 'decrease'],
        required: function() { return this.transactionType === 'kiemke'; }
    },
    adjustmentQuantity: {  // Thêm số lượng điều chỉnh
        type: Number,
        required: function() { return this.transactionType === 'kiemke'; }
    },
    isdeleted: {
        type: Boolean,
        default: false
    }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
