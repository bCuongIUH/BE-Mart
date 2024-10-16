const express = require('express');
const { createPromotion, getAllPromotions, getPromotionById, updatePromotion, deletePromotion } = require('../controller/promotionController');
const router = express.Router();

// router.post('/', createPromotion);
// router.put('/:id', updatePromotion);
// router.delete('/:id', deletePromotion);
// router.get('', getAllPromotions);
// router.get('/:id', getPromotionById);
router.post('/', createPromotion);
router.get('/', getAllPromotions);
router.get('/:id', getPromotionById);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

module.exports = router;
