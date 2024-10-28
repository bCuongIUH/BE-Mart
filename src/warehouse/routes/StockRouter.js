const express = require('express');
const { getAllStocks } = require('../controllers/StockControllers');
const router = express.Router();


router.get('/', getAllStocks);
module.exports = router;