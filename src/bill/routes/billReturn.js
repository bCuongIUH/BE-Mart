const express = require('express');
const { createReturnRequest, getAllReturnRequests } = require('../controllers/CRUDBillController');

const router = express.Router();

// Tạo yêu cầu trả hàng
router.post('/', createReturnRequest);



// Lấy tất cả yêu cầu trả hàng
router.get('/', getAllReturnRequests);



module.exports = router;
