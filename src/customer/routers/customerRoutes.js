const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');

// Endpoint lấy toàn bộ danh sách khách hàng
router.get('/', customerController.getAllCustomers);


module.exports = router;
