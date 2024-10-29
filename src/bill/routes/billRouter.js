const express = require('express');
const { createBill, getBillsByUser, getBillsByStatus, updateBillStatus, createDirectPurchaseBill, getAllBills,getOnlineBills,getOfflineBills, createDirectPurchaseBillKM } = require('../controllers/billController');
const router = express.Router();


// Tạo hóa đơn mới từ giỏ hàng
router.post('/create', createBill);
// trực tiếp
router.post('/create-buy-directly', createDirectPurchaseBill);
// router.post('/create-buy-km', createDirectPurchaseBillKM);
// Lấy hóa đơn theo người dùng
router.get('/user', getBillsByUser);
router.get('/all', getAllBills);
router.get('/online', getOnlineBills);
router.get('/offline', getOfflineBills);
// Lấy hóa đơn theo trạng thái 
router.get('/status', getBillsByStatus);
// Cập nhật trạng thái hóa đơn
router.put('/update-status', updateBillStatus);

module.exports = router;
