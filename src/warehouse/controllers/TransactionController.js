const Product = require('../../products/models/product');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose'); 

exports.getTransactionsByProductCode = async (req, res) => {
    try {
        const { code } = req.params;
     
        // Kiểm tra xem có sản phẩm với mã productCode không
        const product = await Product.findOne({ code });
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm với mã này' });
        }
        
        // Lấy danh sách các giao dịch theo productId và isDelete là false
        const transactions = await Transaction.find({ 
            productId: new mongoose.Types.ObjectId(product._id),
            isDelete: false 
        });
        console.log("Transactions found:", transactions);

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        // Tìm tất cả các giao dịch có isdeleted là false
        const transactions = await Transaction.find({ isdeleted: false }).populate('productId'); 
        

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

