const express = require('express');
const { addEmployee, verifyOTP, getAllEmployee } = require('../controllers/employeeController');

const router = express.Router();

router.post('/add-employee', addEmployee);
router.post('/verify-otp', verifyOTP);
router.get('/', getAllEmployee);
module.exports = router;
