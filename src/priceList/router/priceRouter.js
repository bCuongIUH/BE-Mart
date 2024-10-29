const express = require('express');
const { createPriceList, getAllPriceLists, addPricesToPriceList, getActiveProductPrices, updatePriceListStatus } = require('../controller/priceController');
const { deletePriceList, updatePriceList } = require('../controller/priceCRUD.JS');
const { deletePriceFromPriceList } = require('../controller/priceCRUD.JS');

const router = express.Router();
// const priceListController = require('../controllers/priceListController');

// Create a Price List
router.post('/', createPriceList);
router.post('/addprice/', addPricesToPriceList);
// Get all Price Lists
router.get('/', getAllPriceLists);
router.get('/priceall', getActiveProductPrices);

//lấy giá theo sản phẩm và đơn vị


// Get a single Price List by ID
// router.get('/:id', getPriceListById);
// Cập nhật bảng giá
router.put('/update/:id', updatePriceList);

// Xóa bảng giá
router.delete('/delete/:id', deletePriceList);


router.post('/status', updatePriceListStatus);
router.delete("/:priceListId/product/:productId/price/:priceId", deletePriceFromPriceList);

module.exports = router;
