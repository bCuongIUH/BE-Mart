const express = require('express');
const { addToCart, getCart, removeFromCart,updateCart, getCartShipper, getCartDamua ,getCartHoanTra, getAllCarts} = require('../controllers/cartController');
const { isAdmin,isAuthenticated } = require('../../user/middleware/authMiddleware');


const router = express.Router();

// Thêm sản phẩm vào giỏ hàng
router.post('/add',addToCart);

// Lấy giỏ hàng của người dùng theo trạng thái
router.get('/', getCart);
router.get('/shipper', getCartShipper)
router.get('/damua', getCartDamua)
router.get('/hoantra', getCartHoanTra)
router.get('/all',isAdmin, getAllCarts)
// Xóa mục sản phẩm khỏi giỏ hàng
router.post('/remove', removeFromCart);
//cập nhập trạng thái,s
router.put('/update',isAuthenticated,isAdmin, updateCart)
module.exports = router;
