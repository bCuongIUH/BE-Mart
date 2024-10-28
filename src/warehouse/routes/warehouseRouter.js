
const express = require('express');
const router = express.Router();
const { createWarehouseEntry, getAllWarehouse, getProductsBySupplierId} = require('../controllers/warehouseController');


// Thêm phiếu nhập kho

router.post('/add', createWarehouseEntry);
router.get('/', getAllWarehouse)


router.get('/supplier/:supplierId', getProductsBySupplierId);
module.exports = router;
