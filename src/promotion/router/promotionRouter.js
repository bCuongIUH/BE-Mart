const express = require('express');
const { createPromotionHeader, getAllPromotions, getPromotionById, updatePromotion, deletePromotion ,addPromotionTypes, getPromotionDetails} = require('../controller/promotionController');
const router = express.Router();

//tao thông tin chung
router.post('/', createPromotionHeader);
//thông detail
router.post('/addDetail', addPromotionTypes);
router.get('/', getAllPromotions);
router.get('/:id', getPromotionById);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

router.get('/types/:promotionId', getPromotionDetails);

module.exports = router;
