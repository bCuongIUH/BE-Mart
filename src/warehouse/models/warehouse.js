
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
    supplier: { // sau rảnh, làm them confirm với kho, khi nhập hàng
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
    productId: {  // Liên kết tới Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    createdBy: {  // Thêm trường này để lưu người thêm phiếu
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true,
    },
   
    // exportDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);
module.exports = Warehouse;
