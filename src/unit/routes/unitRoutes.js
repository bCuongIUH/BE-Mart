const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

router.post('/', unitController.createUnit);            
router.post('/unit-lists', unitController.createUnitList);  
router.post('/unit-lists/add-unit', unitController.addUnitToList); 
router.post('/convert', unitController.convertUnit);     

module.exports = router; 