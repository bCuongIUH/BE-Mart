const express = require('express');
const { createPromotion ,updatePromotion,deletePromotion, getAllPromotions} = require('../controller/promotionController');
const router = express.Router();

router.post('/', createPromotion);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);
router.get('', getAllPromotions);
// router.get('/:id', getPromotionById);

module.exports = router;
