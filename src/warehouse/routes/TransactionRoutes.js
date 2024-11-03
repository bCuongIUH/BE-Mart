const express = require('express');
const router = express.Router();
const { getTransactionsByProductCode, getAllTransactions } = require('../controllers/TransactionController');

router.get('/productCode/:code', getTransactionsByProductCode);
router.get('/', getAllTransactions);
module.exports = router;