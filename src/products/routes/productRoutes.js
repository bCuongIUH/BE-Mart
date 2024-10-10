
const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct,getTest } = require('../controllers/productController');

// Tạo sản phẩm mới
router.post('/', addProduct);

// Lấy tất cả sản phẩm
router.get('/', getAllProducts);
router.get('/demo', getTest);
// Lấy sản phẩm theo ID
router.get('/:id', getProductById);

// Cập nhật sản phẩm
router.put('/:id', updateProduct);

// Xóa sản phẩm
router.delete('/:id', deleteProduct);

module.exports = router;
