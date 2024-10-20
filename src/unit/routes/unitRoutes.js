const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');


router.get('/', unitController.getAllUnitLists);
router.post('/', unitController.createUnit);   

router.post('/unit-lists', unitController.createUnitList);  
router.post('/unit-lists/add-unit', unitController.addUnitToList); 
router.post('/convert', unitController.convertUnit);     
router.post('/conversion-rate', unitController.updateConversionRate); 
router.post('/add-unit-to-product',unitController.addUnitToProduct);
router.post('/products/get-converted-quantity', unitController.getConvertedQuantity);

router.post('/getUnit', unitController.getUnitsByUnitListId); 
router.post('/add-conversion-unit', unitController.addConversionUnitToList); 

router.post('/getUnit/all', unitController.getConversionRatesByUnitListId); 
module.exports = router;  