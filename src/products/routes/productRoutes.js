
const express = require('express');
const router = express.Router();
const {  getAllProducts, getProductById, updateProduct, deleteProduct,createProduct,nhapHang, addUnitToProduct, getQuantityInUnit, getConvertedQuantity} = require('../controllers/productController');
const upload = require('../../config/multerConfig');
const { capnhatGia, capnhatTrangThai, capnhatKhoangGia,updatePriceActive } = require('../controllers/priceController');

// Tạo sản phẩm mới
router.post('/', upload.single('image'), createProduct);
// // Lấy tất cả sản phẩm
router.get('/', getAllProducts);

// // Lấy sản phẩm theo ID
// router.get('/:id', getProductById);

// // Cập nhật sản phẩm
router.put('/itemproduct/:id', updateProduct);

//cập nhật giá
router.put('/:id', nhapHang);
router.put('/status/:id', capnhatTrangThai);
router.put('/price/:id', capnhatGia);
router.put('/priceRanges/:id', capnhatKhoangGia);
router.put('/priceRanges/active/:id', updatePriceActive);
router.post('/add-unit', addUnitToProduct);
// // Xóa sản phẩm
router.delete('/:id', deleteProduct);





router.get('/convert-quantity', getConvertedQuantity);

module.exports = router;
