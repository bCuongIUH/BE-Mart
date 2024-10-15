const express = require('express');
const { createPriceList, getAllPriceLists, getPriceListById, updatePriceList, deletePriceList } = require('../controller/priceController');
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

// Delete a Price List
router.delete('/:id', deletePriceList);

module.exports = router;
