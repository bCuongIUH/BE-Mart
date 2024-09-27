
const express = require('express');
const router = express.Router();
const { addWarehouseEntry, updateWarehouseEntry, getAllWarehouse } = require('../controllers/warehouseController');

// Thêm phiếu nhập kho
router.post('/add', addWarehouseEntry);

// Cập nhật phiếu nhập kho
router.put('/:id', updateWarehouseEntry);
//
router.get('/', getAllWarehouse)
module.exports = router;
