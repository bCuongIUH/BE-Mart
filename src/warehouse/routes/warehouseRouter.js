
const express = require('express');
const router = express.Router();
const { createWarehouseEntry, getAllWarehouse, nhapHang} = require('../controllers/warehouseController');


// Thêm phiếu nhập kho
router.post('/add', createWarehouseEntry);
router.get('/', getAllWarehouse)
router.post('/nhap-hang', nhapHang);
module.exports = router;
