const express = require('express');
const { createBill, getBillsByUser, getBillsByStatus, updateBillStatus, createDirectPurchaseBill, getAllBills,getOnlineBills,getOfflineBills, createDirectPurchaseBillKM, returnPurchaseBill ,updateBillStatusByCode, getOnlineBillsThongKe} = require('../controllers/billController');
const { deleteBill } = require('../controllers/CRUDBillController');
const router = express.Router();


// Tạo hóa đơn mới từ giỏ hàng
router.post('/create', createBill);
// trực tiếp
router.post('/create-buy-directly', createDirectPurchaseBill);
router.post('/return-bill', returnPurchaseBill);
// Lấy hóa đơn theo người dùng
router.get('/user', getBillsByUser);
router.get('/all', getAllBills);
router.get('/online', getOnlineBills);
router.get('/onlineTK', getOnlineBillsThongKe);
router.get('/offline', getOfflineBills);
// Lấy hóa đơn theo trạng thái 
router.get('/status', getBillsByStatus);
// Cập nhật trạng thái hóa đơn
router.put('/update-status', updateBillStatus);
router.delete('/bills/:id', deleteBill);
router.put("/update-status-by-code", updateBillStatusByCode);
module.exports = router;
