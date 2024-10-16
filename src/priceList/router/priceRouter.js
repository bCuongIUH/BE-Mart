const express = require('express');
const { createPriceList, getAllPriceLists, getPriceListById, updatePriceList, deletePriceList, addPricesToPriceList, activatePriceList, deactivatePriceList } = require('../controller/priceController');
const router = express.Router();
// const priceListController = require('../controllers/priceListController');

// Create a Price List
router.post('/', createPriceList);

// Get all Price Lists
router.get('/', getAllPriceLists);

// Get a single Price List by ID
router.get('/:id', getPriceListById);

// Update a Price List
router.put('/:id', updatePriceList);
router.post('/addprice/', addPricesToPriceList);
// Delete a Price List
router.delete('/:id', deletePriceList);

router.post('/activate', activatePriceList);

router.post('/deactivate', deactivatePriceList);
module.exports = router;
