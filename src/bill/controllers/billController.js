const Bill = require('../models/billModel');
const Cart = require('../../cart/model/cart');
const Product = require('../../products/models/product');

// Tạo hóa đơn từ giỏ hàng đã mua
//update ngày 10/7 
exports.createBill = async (req, res) => {
  try {
    const { userId, paymentMethod } = req.body;
    console.log('userId:', userId, 'paymentMethod:', paymentMethod); 
    const cart = await Cart.findOne({ user: userId, status: 'ChoThanhToan' }).populate('items.product');
    // console.log('Giỏ hàng:', cart); 
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Giỏ hàng trống hoặc không có sản phẩm nào để thanh toán' });
    }

    const totalAmount = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
    
    const bill = new Bill({
      user: userId,
      items: cart.items,
      totalAmount,
      paymentMethod,
    });
    await bill.save();

    cart.status = 'Shipped'; 
    await cart.save();

    for (const item of cart.items) {
      const productLine = item.product.lines[0];
      const newQuantity = productLine.quantity - item.quantity;
  
      if (newQuantity < 0) {
        return res.status(400).json({ message: 'Số lượng sản phẩm trong kho không đủ' });
      }
  
      productLine.quantity = newQuantity;
      await item.product.save(); 
    }
  
    res.status(201).json({ message: 'Hóa đơn đã được tạo thành công', bill });
  } catch (error) {
    console.error('Lỗi :', error); 
    res.status(500).json({ message: error.message });
  }
};

//mua hàng trục tiếp
exports.createDirectPurchaseBill = async (req, res) => {
  try {
    const { paymentMethod, phoneNumber, items } = req.body; 
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
    }
    const totalAmount = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const bill = new Bill({
      user: null, 
      items,
      totalAmount,
      paymentMethod,
      phoneNumber, 
      status: 'Paid' 
    });
    await bill.save();
    // Giảm số lượng từng sản phẩm trong kho
    for (const item of items) {
      const product = await Product.findById(item.product).populate('lines');
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID ${item.product}` });
      }
      const productLine = product.lines[0]; 
      const newQuantity = productLine.quantity - item.quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ message: `Số lượng sản phẩm ${product.name} trong kho không đủ` });
      }
      productLine.quantity = newQuantity; 
      await product.save(); 
    }

    res.status(201).json({ message: 'Hóa đơn đã được tạo thành công', bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách hóa đơn của người dùng
exports.getBillsByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const bills = await Bill.find({ user: userId }).populate('items.product');
    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: 'Không có hóa đơn nào' });
    }
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin hóa đơn theo trạng thái
exports.getBillsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const bills = await Bill.find({ status }).populate('items.product');
    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: 'Không có hóa đơn nào với trạng thái này' });
    }
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái hóa đơn (ví dụ: từ 'Pending' sang 'Paid')
exports.updateBillStatus = async (req, res) => {
  try {
    const { billId, status } = req.body;
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }
    bill.status = status;
    await bill.save();
    res.status(200).json({ message: 'Trạng thái hóa đơn đã được cập nhật', bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
