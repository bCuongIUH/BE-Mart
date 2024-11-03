
const express = require('express');
const multer = require('multer');
const uploads = multer();
const router = express.Router();
const {  getAllProducts, getProductByCode, updateProduct, deleteProduct,createProduct,nhapHang, getAllProductsPOP, getProductsByCategory} = require('../controllers/productController');
const upload = require('../../config/multerConfig');
const { capnhatGia, capnhatTrangThai, capnhatKhoangGia,updatePriceActive } = require('../controllers/priceController');

// Tạo sản phẩm mới
router.post('/', upload.single('image'), createProduct);
// // Lấy tất cả sản phẩm
router.get('/', getAllProducts);
router.get('/code/:code', getProductByCode);
router.get('/pop', getAllProductsPOP);

router.get('/category/:categoryId', getProductsByCategory);

// // Cập nhật sản phẩm
router.put('/update/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
//cập nhật giá

router.put('/status/:id', capnhatTrangThai);
router.put('/price/:id', capnhatGia);
router.put('/priceRanges/:id', capnhatKhoangGia);
router.put('/priceRanges/active/:id', updatePriceActive);




module.exports = router;
