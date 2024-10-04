const Cart = require('../model/cart');
const Product = require('../../products/models/product');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body; 
    if (!userId) {
      return res.status(400).json({ message: 'User ID không có' });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    const unitPrice = product.lines[0].unitPrice;

    // Tính tổng
    const totalPrice = unitPrice * quantity;
  
    let cart = await Cart.findOne({ user: userId, status: 'ChoThanhToan' });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{
          product: productId,
          quantity,
          unitPrice,
          totalPrice
        }]
      });
    } else {
      const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice += totalPrice;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          unitPrice,
          totalPrice
        });
      }
    }
    // Lưu giỏ hàng
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, res) => {
  // console.log('Đang gọi API /api/cart');
  try {
    // const userId = req.query.userId.trim();
    const userId = req.query.userId;
 
    console.log('User ID CTT:', userId); 

    if (!userId) {
      return res.status(400).json({ message: 'Thiếu thông tin người dùng' });
    }

    const cart = await Cart.findOne({ user: userId, status: 'ChoThanhToan' }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//đơn hàng đang vận chuyển
exports.getCartShipper = async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log('User ID:', userId); 
    const ShippedCart = await Cart.find({ user: userId,status :'Shipped'}).populate('items.product');
    if (!ShippedCart || ShippedCart.length === 0) {
      return res.status(404).json({ message: 'Không có đơn hàng vận chuyển' });
    }
    res.status(200).json(ShippedCart);
  } catch (error) {
    res.status(500).json({message:error.message})
  }
};
//đơn hàng hoàn thành
exports.getCartDamua= async (req, res) => {
  try {
    const userId = req.query.userId;
    const DaMuaCart = await Cart.find({user: userId,status :'DaMua'}).populate('items.product');
    if (!DaMuaCart || DaMuaCart.length === 0) {
      return res.status(404).json({ message: 'Không có đơn hàng nào đã mua' });
    }
    res.status(200).json(DaMuaCart);
  } catch (error) {
    res.status(500).json({message:error.message})
  }
};
//đơn hàng hoàn trả
exports.getCartHoanTra= async (req, res) => {
  try {
    const userId = req.query.userId;
    const HoanTraCart = await Cart.find({user: userId,status :'HoanTra'}).populate('items.product');
    if (!HoanTraCart || HoanTraCart.length === 0) {
      return res.status(404).json({ message: 'Không có đơn hàng hoàn trả' });
    }
    res.status(200).json(HoanTraCart);
  } catch (error) {
    res.status(500).json({message:error.message})
  }
};

// Lấy toàn bộ giỏ hàng để nhân viên quản lí
exports.getAllCarts = async (req, res) => {
  try {
  
      const carts = await Cart.find().populate('user').populate('items.product');
      res.status(200).json(carts);
  } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error: error.message });
  }
};
//update trạng thái giỏ hàng
// exports.updateCart = async (req, res) => {
//   try {
//     const { cartId, status } = req.body;
//     const cart = await Cart.findById(cartId).populate('items.product');

//     if (!cart) {
//       return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
//     }
//     if (cart.status === 'ChoThanhToan' && status !== 'ChoThanhToan') {
//       cart.status = status;
//       for (const item of cart.items) {
//         const productLine = item.product.lines[0];
//         const newQuantity = productLine.quantity - item.quantity;

//         if (newQuantity < 0) {
//           return res.status(400).json({ message: 'Số lượng sản phẩm trong kho không đủ' });
//         }
//         productLine.quantity = newQuantity;
//         await item.product.save(); 
//       }
//     } else {
//       cart.status = status;
//     }
//     // Lưu giỏ hàng
//     await cart.save();
//     res.status(200).json(cart);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.updateCart = async (req, res) => {
  try {
      const { cartId, userId, status } = req.body;

      // Kiểm tra thông tin cần thiết
      if (!cartId || !userId || !status) {
          return res.status(400).json({ message: 'Thiếu thông tin giỏ hàng, ID người dùng hoặc trạng thái' });
      }

      const cart = await Cart.findById(cartId).populate('items.product');
      if (!cart) {
          return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
      }

      // Xóa các sản phẩm không có
      cart.items = cart.items.filter(item => item.product !== null);

      // Cập nhật trạng thái giỏ hàng
      if (cart.status === 'ChoThanhToan' && status !== 'ChoThanhToan') {
          cart.status = status;

          for (const item of cart.items) {
              const productLine = item.product.lines[0];
              const newQuantity = productLine.quantity - item.quantity;

              if (newQuantity < 0) {
                  return res.status(400).json({ message: 'Số lượng sản phẩm trong kho không đủ' });
              }

              productLine.quantity = newQuantity;
              await item.product.save();
          }
      } else {
          cart.status = status;
      }

      // Gán ID của admin
      cart.admin = userId; // Sử dụng userId từ yêu cầu
     
      // Lưu giỏ hàng
      await cart.save();
      res.status(200).json(cart);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
};
;

//xóa
exports.removeProductFromCart = async (req, res) => {
  try {
      const { cartId, productId } = req.body;
      // Tìm giỏ hàng
      const cart = await Cart.findById(cartId);
      if (!cart) {
          return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
      }
      const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);
      if (itemIndex === -1) {
          return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
      }
      // Xóa sản phẩm khỏi giỏ hàng
      cart.items.splice(itemIndex, 1);
      // Lưu giỏ hàng
      await cart.save();
      res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng', cart });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};



//hoàn trả sp 
