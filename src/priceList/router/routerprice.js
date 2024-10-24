const express = require('express');
const router = express.Router();

// Import controller
const priceListController = require('../controller/priceControllerV2');

// Tạo header cho bảng giá
router.post('/create-header', priceListController.createPriceListHeader);

// Thêm sản phẩm và giá vào bảng giá đã tạo
router.post('/add-products', priceListController.addProductsToPriceList);


router.get('/all/:priceListId', priceListController.getPriceListDetails);
module.exports = router;
