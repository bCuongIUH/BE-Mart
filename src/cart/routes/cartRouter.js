const express = require('express');
const { addToCart, getCart, removeFromCart,updateCart } = require('../controllers/cartController');
const { authMiddleware } = require('../../user/middleware/authMiddleware');


const router = express.Router();

// Thêm sản phẩm vào giỏ hàng
router.post('/add',addToCart);

// Lấy giỏ hàng của người dùng
router.get('/', getCart);

// Xóa mục sản phẩm khỏi giỏ hàng
router.post('/remove', removeFromCart);
//cập nhập trạng thái,
router.put('/update', updateCart)
module.exports = router;
