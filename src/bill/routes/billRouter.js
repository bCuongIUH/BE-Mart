const express = require('express');
const { createBill, getBillsByUser, getBillsByStatus, updateBillStatus, createDirectPurchaseBill } = require('../controllers/billController');
const router = express.Router();


// Tạo hóa đơn mới từ giỏ hàng
router.post('/create', createBill);
// trực tiếp
router.post('/create-buy-directly', createDirectPurchaseBill);
// Lấy hóa đơn theo người dùng
router.get('/user', getBillsByUser);
// Lấy hóa đơn theo trạng thái 
router.get('/status', getBillsByStatus);
// Cập nhật trạng thái hóa đơn
router.put('/update-status', updateBillStatus);

module.exports = router;