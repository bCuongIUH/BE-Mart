const express = require('express');
const router = express.Router();
const zaloPayController = require('../controller/zaloPayController');

// Route tạo đơn hàng
router.post('/payment', zaloPayController.createPayment);

// Route callback từ ZaloPay
router.post('/callback', zaloPayController.callback);

// Route kiểm tra trạng thái đơn hàng
router.post('/check-status-order', zaloPayController.checkOrderStatus);
module.exports = router;
