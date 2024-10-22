const express = require('express');
const router = express.Router();
const { createUnitHeader, createUnitLine, createUnitDetail } = require('../controllers/UnitController');

// Route cho các hàm API
router.post('/unit-headers', createUnitHeader);
router.post('/unit-lines', createUnitLine);
router.post('/unit-details', createUnitDetail);


module.exports = router;
