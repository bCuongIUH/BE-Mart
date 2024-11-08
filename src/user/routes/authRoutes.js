const express = require('express');
const { login,register, verifyOTP, getToken ,removeCookie,removeToken, forgotPassword, verifyForgotPasswordOTP, changePassword, getAllUsers,updateUserRole, checkToken, someProtectedRoute, resendOTP, resetPassword  } = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
// đăng ký, đăng nhập, xác minh OTP
router.post('/login', login);
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
// token
router.get('/removeCookie', removeCookie);
router.get('/removeToken', removeToken);
router.get('/getToken', getToken);
//mật khẩu 
router.post('/forgot-password', forgotPassword); // chưa xong

router.post('/password-otp', verifyForgotPasswordOTP);
router.post('/resetPassword', resetPassword); 

// Route để đổi mật khẩu
router.post('/change-password', changePassword); //chưa xong
// lấy tất cả user
router.get('/all-user', getAllUsers);
router.patch('/users/update-role/:id', updateUserRole);
// router.get('/check-token', checkToken);
// router.get('/protected',  someProtectedRoute);

module.exports = router;