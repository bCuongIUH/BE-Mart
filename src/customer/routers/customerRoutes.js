const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');


router.get('/', customerController.getAllCustomers);
router.put('/:id', customerController.updateCustomer);

module.exports = router;
