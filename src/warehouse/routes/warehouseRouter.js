
const express = require('express');
const router = express.Router();
const { addWarehouseEntry, getAllWarehouse} = require('../controllers/warehouseController');


// Thêm phiếu nhập kho
router.post('/add', addWarehouseEntry);
router.get('/', getAllWarehouse)
module.exports = router;
