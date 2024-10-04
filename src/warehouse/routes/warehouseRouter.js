
const express = require('express');
const router = express.Router();
const { addWarehouseEntry, updateWarehouseEntry, getAllWarehouse, deleteWarehouseEntry } = require('../controllers/warehouseController');

// Thêm phiếu nhập kho
router.post('/add', addWarehouseEntry);

// Cập nhật phiếu nhập kho
router.put('/update/:id', updateWarehouseEntry);
//
router.get('/', getAllWarehouse)
router.delete('/delete/:id', deleteWarehouseEntry);
module.exports = router;
