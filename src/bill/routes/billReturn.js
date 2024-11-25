const express = require('express');
const { createReturnRequest, getAllReturnRequests, updateBillStatusOnl } = require('../controllers/CRUDBillController');
const upload = require('../../config/multerConfig');
const router = express.Router();

// Tạo yêu cầu trả hàng
router.post('/', upload.single('images'), createReturnRequest);



// Lấy tất cả yêu cầu trả hàng
router.get('/', getAllReturnRequests);
router.post('/update-status', updateBillStatusOnl);


module.exports = router;
