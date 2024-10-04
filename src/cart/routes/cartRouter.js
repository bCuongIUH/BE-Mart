const express = require('express');
const { addToCart, getCart, removeProductFromCart,updateCart, getCartShipper, getCartDamua ,getCartHoanTra, getAllCarts} = require('../controllers/cartController');
const { isAdmin,isAuthenticated } = require('../../user/middleware/authMiddleware');


const router = express.Router();

// Thêm sản phẩm vào giỏ hàng
router.post('/add',addToCart);

// Lấy giỏ hàng của người dùng theo trạng thái
router.get('/', getCart); // thằng nào cx lấy dc , ko ràng buộc
router.get('/shipper', getCartShipper)
router.get('/damua', getCartDamua)
router.get('/hoantra', getCartHoanTra)
//admin xem toàn bộ giỏ hàng của ngườu dùng
router.get('/all', getAllCarts) //isAdmin
// Xóa mục sản phẩm khỏi giỏ hàng
router.delete('/remove', removeProductFromCart);
//cập nhập trạng thái,s
router.put('/update', updateCart)
module.exports = router;
