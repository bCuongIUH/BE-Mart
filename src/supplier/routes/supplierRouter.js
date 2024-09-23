const express = require('express');
const router = express.Router();
const { addSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier } = require('../controllers/supplierController');

// Tạo nhà cung cấp mới
router.post('/add', addSupplier);

// Lấy tất cả nhà cung cấp
router.get('/', getAllSuppliers);

// Lấy nhà cung cấp theo ID
router.get('/:id', getSupplierById);

// Cập nhật nhà cung cấp
router.put('/:id', updateSupplier);

// Xóa nhà cung cấp
router.delete('/:id', deleteSupplier);

module.exports = router;
