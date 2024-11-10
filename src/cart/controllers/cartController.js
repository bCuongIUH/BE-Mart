const Cart = require("../model/cart");
const Product = require("../../products/models/product");
const PriceList = require("../../priceList/model/priceModels");
const Stock = require("../../warehouse/models/Stock");

// Thêm sản phẩm vào giỏ hàng

exports.addToCart = async (req, res) => {
  try {
    const { customerId, productId, quantity, unit, price } = req.body;

    if (!customerId || !productId || !quantity || !unit || !price) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin cần thiết" });
    }

    // Tìm giỏ hàng của khách hàng
    let cart = await Cart.findOne({ customer: customerId });

    // Nếu giỏ hàng không tồn tại, tạo giỏ hàng mới
    if (!cart) {
      cart = new Cart({
        customer: customerId,
        items: [{
          product: productId,
          quantity,
          currentPrice: price,
          totalPrice: price * quantity, 
          unit: unit,
          status: "ChoThanhToan",
        }],
      });
    } else {
      // Tìm sản phẩm trong giỏ hàng
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId && item.unit === unit
      );

      if (existingItemIndex > -1) {
        // Nếu sản phẩm đã tồn tại, kiểm tra trạng thái
        if (cart.items[existingItemIndex].status === "ChuaChon") {
          // Nếu trạng thái là "ChuaChon", cập nhật lại số lượng và giá mới
          cart.items[existingItemIndex].quantity = quantity; 
          cart.items[existingItemIndex].currentPrice = price; 
          cart.items[existingItemIndex].totalPrice = price * quantity;
          cart.items[existingItemIndex].status = "ChoThanhToan"; 
        } else {
          // Nếu trạng thái là "ChoThanhToan", cộng dồn số lượng và cập nhật tổng giá
          cart.items[existingItemIndex].quantity += quantity;
          cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].currentPrice * cart.items[existingItemIndex].quantity;
        }
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới với trạng thái "ChoThanhToan"
        cart.items.push({
          product: productId,
          quantity,
          currentPrice: price,
          totalPrice: price * quantity,
          unit: unit,
          status: "ChoThanhToan",
        });
      }
    }
    // Lưu giỏ hàng đã cập nhật
    await cart.save();
    res.status(200).json({ success: true, message: "Thêm sản phẩm vào giỏ hàng thành công!", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//xóa item giỏ hàng
exports.removeItemsFromCart = async (req, res) => {
  try {
    const { cartId, itemIds } = req.body;

    // Kiểm tra sự tồn tại của cartId và itemIds
    if (!cartId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin cartId hoặc itemIds" });
    }

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    // Xóa các item có ID trong `itemIds`
    cart.items = cart.items.filter(item => !itemIds.includes(item._id.toString()));

    await cart.save();
    res.status(200).json({ success: true, message: "Đã xóa các sản phẩm khỏi giỏ hàng", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//update
exports.updateCartStatus = async (req, res) => {
  const { cartId, itemId } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId && item.status === "ChoThanhToan");
    
    // Kiểm tra nếu không có sản phẩm nào với trạng thái "ChoThanhToan"
    if (itemIndex === -1) {
      return res.status(200).json({ 
        success: false, 
        message: "Không có sản phẩm nào với trạng thái 'ChoThanhToan' cần cập nhật" 
      });
    }

    // Cập nhật trạng thái sản phẩm thành "ChuaChon"
    const item = cart.items[itemIndex];
    item.status = "ChuaChon";

    // Cập nhật lại tồn kho
    const stock = await Stock.findOne({ productId: item.product, unit: item.unit });
    if (stock) {
      stock.quantity += item.quantity;
      stock.lastUpdated = Date.now();
      await stock.save();
    }

    // Xóa sản phẩm ra khỏi giỏ hàng
    cart.items.splice(itemIndex, 1);

    // Lưu lại giỏ hàng
    await cart.save();

    return res.status(200).json({
      success: true,
      message: `Trạng thái sản phẩm đã được cập nhật thành "ChuaChon" và sản phẩm đã được xóa khỏi giỏ hàng`,
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//
exports.addToCartOffline = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const unitPrice = product.currentPrice;

    // Tính tổng
    const totalPrice = unitPrice * quantity;

    let cart = await Cart.findOne({ status: "ChoThanhToan" });
    if (!cart) {
      cart = new Cart({
        items: [
          {
            product: productId,
            quantity,
            unitPrice,
            totalPrice,
          },
        ],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice += totalPrice;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          unitPrice,
          totalPrice,
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
  try {
    const customerId = req.query.customerId;

    if (!customerId) {
      return res.status(400).json({ message: "Thiếu thông tin khách hàng" });
    }

    // Tìm giỏ hàng của customer
    let cart = await Cart.findOne({ customer: customerId })
      .populate("items.product");

    // Nếu không tìm thấy giỏ hàng, trả về giỏ hàng trống với status `200`
    if (!cart) {
      return res.status(200).json({ message: "Giỏ hàng trống", items: [] });
    }

    // Lọc các item có status là "ChoThanhToan"
    cart.items = cart.items.filter(item => item.status === "ChoThanhToan");

    // Kiểm tra nếu giỏ hàng sau khi lọc không có item nào
    if (cart.items.length === 0) {
      return res.status(200).json({ message: "Không có sản phẩm nào trong giỏ hàng với trạng thái 'ChoThanhToan'", items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//đơn hàng đang vận chuyển
exports.getCartShipper = async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log("User ID:", userId);
    const ShippedCart = await Cart.find({
      user: userId,
      status: "Shipped",
    }).populate("items.product");
    if (!ShippedCart || ShippedCart.length === 0) {
      return res.status(404).json({ message: "Không có đơn hàng vận chuyển" });
    }
    res.status(200).json(ShippedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//đơn hàng hoàn thành
exports.getCartDamua = async (req, res) => {
  try {
    const userId = req.query.userId;
    const DaMuaCart = await Cart.find({
      user: userId,
      status: "DaMua",
    }).populate("items.product");
    if (!DaMuaCart || DaMuaCart.length === 0) {
      return res.status(404).json({ message: "Không có đơn hàng nào đã mua" });
    }
    res.status(200).json(DaMuaCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//đơn hàng hoàn trả
exports.getCartHoanTra = async (req, res) => {
  try {
    const userId = req.query.userId;
    const HoanTraCart = await Cart.find({
      user: userId,
      status: "HoanTra",
    }).populate("items.product");
    if (!HoanTraCart || HoanTraCart.length === 0) {
      return res.status(404).json({ message: "Không có đơn hàng hoàn trả" });
    }
    res.status(200).json(HoanTraCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy toàn bộ giỏ hàng để nhân viên quản lí
// Lấy toàn bộ giỏ hàng để nhân viên quản lí
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate("user").populate("items.product");

    res.status(200).json(carts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy giỏ hàng", error: error.message });
  }
};

// Lấy toàn bộ đơn hàng ngoại trừ những đơn hàng đang chờ thanh toán
exports.getAllCartsExceptPending = async (req, res) => {
  try {
    const carts = await Cart.find({ status: { $ne: "ChoThanhToan" } }).populate(
      "items.product"
    );

    if (!carts || carts.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có đơn hàng nào ngoại trừ ChoThanhToan" });
    }

    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    if (!cartId || !userId || !status) {
      return res.status(400).json({
        message: "Thiếu thông tin giỏ hàng, ID người dùng hoặc trạng thái",
      });
    }

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    cart.status = status;
    cart.admin = userId;

    // Lưu giỏ hàng
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//xóa
exports.removeProductFromCart = async (req, res) => {
  try {
    const { cartId, productId, unit } = req.body;
    // Tìm giỏ hàng
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product._id.toString() === productId &&
        (item.unit === unit || (!item.unit && !unit))
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    cart.items.splice(itemIndex, 1);

    // Lưu giỏ hàng
    await cart.save();
    res
      .status(200)
      .json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//hoàn trả sp
