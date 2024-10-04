const express = require('express');
const { createBill, getBillsByUser, getBillsByStatus, updateBillStatus } = require('../controllers/billController');
const router = express.Router();


// Tạo hóa đơn mới từ giỏ hàng
router.post('/create', createBill);
// Lấy hóa đơn theo người dùng
router.get('/user', getBillsByUser);
// Lấy hóa đơn theo trạng thái 
router.get('/status', getBillsByStatus);
// Cập nhật trạng thái hóa đơn
router.put('/update-status', updateBillStatus);

module.exports = router;
