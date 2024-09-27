const express = require('express');
const { login,register, verifyOTP, getToken ,removeCookie,removeToken, forgotPassword, verifyForgotPasswordOTP, changePassword, getAllUsers,updateUserRole  } = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
// đăng ký, đăng nhập, xác minh OTP
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
// token
router.get('/removeCookie', removeCookie);
router.get('/removeToken', removeToken);
router.get('/getToken', getToken);
//mật khẩu 
router.post('/forgot-password', forgotPassword); // chưa xong
// Route để xác minh OTP và lấy token đặt lại mật khẩu
router.post('/verify-otp', verifyForgotPasswordOTP); // chưa xong

// Route để đổi mật khẩu
router.post('/change-password', changePassword); //chưa xong
// lấy tất cả user
router.get('/all-user', getAllUsers);
router.patch('/users/update-role/:id', updateUserRole);



module.exports = router;