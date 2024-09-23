// src/Warehouses/routes/warehouseRouter.js
const express = require('express');
const router = express.Router();
const { addWarehouseEntry, updateWarehouseEntry } = require('../controllers/warehouseController');

// Thêm phiếu nhập kho
router.post('/add', addWarehouseEntry);

// Cập nhật phiếu nhập kho
router.put('/:id', updateWarehouseEntry);

module.exports = router;
