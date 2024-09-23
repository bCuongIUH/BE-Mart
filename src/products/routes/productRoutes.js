// const express = require('express');
// const router = express.Router();
// const adminMiddleware = require('../../user/middleware/adminMiddleware');
// const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');

// // Tạo sản phẩm mới
// router.post('/',  createProduct);

// // Lấy tất cả sản phẩm
// router.get('/', getAllProducts);

// // Lấy sản phẩm theo ID
// router.get('/:id', getProductById);

// // Cập nhật sản phẩm
// router.put('/:id',  updateProduct);

// // Xóa sản phẩm
// router.delete('/:id',  deleteProduct);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');

// Tạo sản phẩm mới
router.post('/', addProduct);

// Lấy tất cả sản phẩm
router.get('/', getAllProducts);

// Lấy sản phẩm theo ID
router.get('/:id', getProductById);

// Cập nhật sản phẩm
router.put('/:id', updateProduct);

// Xóa sản phẩm
router.delete('/:id', deleteProduct);

module.exports = router;
