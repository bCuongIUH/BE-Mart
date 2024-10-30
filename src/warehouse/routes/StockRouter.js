const express = require('express');
const { getAllStocks } = require('../controllers/StockControllers');
const { createInventoryAudit, getInventoryList } = require('../controllers/InvenStockController');
const router = express.Router();


router.get('/', getAllStocks);
router.post('/invenstock/update', createInventoryAudit);
router.get('/invenstock', getInventoryList);
module.exports = router;