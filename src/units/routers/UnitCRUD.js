const express = require('express');
const router = express.Router();
const unitControllerH = require('../controllers/UnitHeader'); 
const unitControllerL = require('../controllers/UnitLines'); 
const unitControllerD = require('../controllers/UnitDetails'); 
// UnitHeader Routes
// router.post('/headers', unitController.createUnitHeader);
router.get('/headers', unitControllerH.getAllUnitHeaders);
router.get('/headers/:id', unitControllerH.getUnitHeaderById);
router.put('/headers/:id', unitControllerH.updateUnitHeader);
router.delete('/headers/:id', unitControllerH.deleteUnitHeader);

// UnitLine Routes
// router.post('/lines', unitController.createUnitLine);
router.get('/lines', unitControllerL.getAllUnitLines);
router.get('/lines/:id', unitControllerL.getUnitLineById);
router.put('/lines/:id', unitControllerL.updateUnitLine);
router.delete('/lines/:id', unitControllerL.deleteUnitLine);

// UnitDetail Routes
// router.post('/details', unitController.createUnitDetail);
router.get('/details', unitControllerD.getAllUnitDetails);
router.get('/details/:id', unitControllerD.getUnitDetailById);
router.put('/details/:id', unitControllerD.updateUnitDetail);
router.delete('/details/:id', unitControllerD.deleteUnitDetail);

module.exports = router;
