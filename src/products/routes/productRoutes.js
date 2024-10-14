
const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct,getTest ,createProduct,nhapHang, capnhatGia} = require('../controllers/productController');
const upload = require('../../config/multerConfig');

// Tạo sản phẩm mới
router.post('/', upload.single('image'), createProduct);
// // Lấy tất cả sản phẩm
router.get('/', getAllProducts);
// router.get('/demo', getTest);
// // Lấy sản phẩm theo ID
router.get('/:id', getProductById);

// // Cập nhật sản phẩm
router.put('/itemproduct/:id', updateProduct);
router.put('/:id', nhapHang);

// // Xóa sản phẩm
router.delete('/:id', deleteProduct);
router.put('/price/:id', capnhatGia);
module.exports = router;
