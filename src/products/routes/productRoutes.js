
const express = require('express');
const router = express.Router();
const {  getAllProducts, getProductById, updateProduct, deleteProduct,createProduct,nhapHang, getAllProductsPOP} = require('../controllers/productController');
const upload = require('../../config/multerConfig');
const { capnhatGia, capnhatTrangThai, capnhatKhoangGia,updatePriceActive } = require('../controllers/priceController');

// Tạo sản phẩm mới
router.post('/', upload.single('image'), createProduct);
// // Lấy tất cả sản phẩm
router.get('/', getAllProducts);
router.get('/POP', getAllProductsPOP);

// // Lấy sản phẩm theo ID
router.get('/product/:id', getProductById);

// // Cập nhật sản phẩm
router.put('/itemproduct/:id', updateProduct);

//cập nhật giá
router.put('/:id', nhapHang);
router.put('/status/:id', capnhatTrangThai);
router.put('/price/:id', capnhatGia);
router.put('/priceRanges/:id', capnhatKhoangGia);
router.put('/priceRanges/active/:id', updatePriceActive);

// // Xóa sản phẩm
router.delete('/:id', deleteProduct);

module.exports = router;
