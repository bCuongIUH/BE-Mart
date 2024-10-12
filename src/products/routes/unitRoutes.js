const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

// Định nghĩa các route cho Unit
router.get('/', unitController.getUnits);          
router.post('/', unitController.addUnit);           
router.put('/:id', unitController.updateUnit);     
router.delete('/:id', unitController.deleteUnit);  

module.exports = router;
