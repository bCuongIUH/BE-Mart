const express = require('express');
const { addEmployee, verifyOTP, getAllEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');

const router = express.Router();

router.post('/add-employee', addEmployee);
router.post('/verify-otp', verifyOTP);
router.get('/', getAllEmployee);
// Route để sửa nhân viên
router.put('/:id', updateEmployee);

// Route để xóa nhân viên
router.delete('/:id',deleteEmployee);
module.exports = router;
