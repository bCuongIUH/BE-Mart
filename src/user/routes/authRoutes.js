const express = require('express');
const { login,register, verifyOTP, getToken ,removeCookie,removeToken, forgotPassword, verifyForgotPasswordOTP, changePassword  } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
// Define routes
router.get('/removeCookie', removeCookie);
router.get('/removeToken', removeToken);
router.get('/getToken', getToken);
//mật khẩu 
router.post('/forgot-password', forgotPassword);

// Route để xác minh OTP và lấy token đặt lại mật khẩu
router.post('/verify-otp', verifyForgotPasswordOTP);

// Route để đổi mật khẩu
router.post('/change-password', changePassword);


module.exports = router;