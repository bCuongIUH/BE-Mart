const express = require('express');
const { login,register, verifyOTP, getToken ,removeCookie,removeToken} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
// Define routes
router.get('/users/removeCookie', removeCookie);
router.get('/users/removeToken', removeToken);
router.get('/users/getToken', getToken);


module.exports = router;