const Bill = require('../models/billModel');
const Cart = require('../../cart/model/cart');
const Product = require('../../products/models/product');
const Stock = require('../../warehouse/models/Stock');
const Voucher = require('../../promotion/models/Voucher');
const FixedDiscountVoucher = require('../../promotion/models/FixedDiscountVoucher');
const PercentageDiscountVoucher = require('../../promotion/models/PercentageDiscountVoucher');
const BuyXGetYVoucher = require('../../promotion/models/BuyXGetYVoucher');

// Tạo hóa đơn từ giỏ hàng đã mua
//update ngày 10/7 
exports.createBill = async (req, res) => {
  try {
    const { userId, paymentMethod } = req.body;

    // Validate inputs
    if (!userId || !paymentMethod) {
      return res.status(400).json({
        message: "Thiếu thông tin người dùng hoặc phương thức thanh toán.",
      });
    }

    // Lấy giỏ hàng đang chờ thanh toán của người dùng
    const cart = await Cart.findOne({
      user: userId,
      status: "ChoThanhToan",
    }).populate("items.product");

    // Kiểm tra nếu giỏ hàng tồn tại và có sản phẩm
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        message: "Giỏ hàng trống hoặc không có sản phẩm nào để thanh toán",
      });
    }

    // Tính tổng tiền của hóa đơn
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + (item.totalPrice || 0),
      0
    );

    // Tạo hóa đơn mới
    const bill = new Bill({
      user: userId,
      items: cart.items,
      totalAmount,
      paymentMethod,
      purchaseType: "Online",
    });

    await bill.save();

    // Trừ số lượng tồn kho theo đơn vị tính của mỗi sản phẩm
    for (const item of cart.items) {
      const stock = await Stock.findOne({
        productId: item.product._id,
        unit: item.unit,
      });

      // Kiểm tra nếu tồn kho đủ số lượng
      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${item.product.name} không đủ số lượng tồn kho.`,
        });
      }

      // Trừ số lượng trong tồn kho
      stock.quantity -= item.quantity;
      await stock.save();
    }

    // Cập nhật trạng thái của giỏ hàng sau khi thanh toán
    cart.status = "Shipped";
    await cart.save();

    res.status(201).json({ message: "Hóa đơn đã được tạo thành công", bill });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: error.message });
  }
};
// exports.createDirectPurchaseBill = async (req, res) => {
//   try {
//     const { paymentMethod, phoneNumber, items, createBy } = req.body;
//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
//     }

//     // Tính tổng tiền của hóa đơn dựa trên số lượng và giá của mỗi sản phẩm
//     const totalAmount = items.reduce((acc, item) => acc + (item.currentPrice * item.quantity), 0);

//     // Tạo hóa đơn mới cho giao dịch mua hàng trực tiếp
//     const bill = new Bill({
//       user: null, 
//       items,
//       totalAmount,
//       paymentMethod,
//       phoneNumber : phoneNumber || '', 
//       status: 'Paid', 
//       purchaseType: 'Offline',
//       createBy
//     });

//     await bill.save();

//     // Kiểm tra và cập nhật tồn kho cho từng sản phẩm
//     for (const item of items) {
//       const stock = await Stock.findOne({
//         productId: item.product,
//         unit: item.unit,
//       });

//       // Kiểm tra nếu tồn kho không đủ số lượng
//       if (!stock || stock.quantity < item.quantity) {
//         return res.status(400).json({
//           message: `Sản phẩm ${item.product} không đủ số lượng tồn kho cho đơn vị ${item.unit}.`
//         });
//       }

//       // Trừ số lượng sản phẩm trong tồn kho
//       stock.quantity -= item.quantity;
//       await stock.save();
//     }

//     res.status(201).json({ message: 'Hóa đơn đã được tạo thành công', bill });
//   } catch (error) {
//     console.error("Lỗi:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


//
exports.createDirectPurchaseBill = async (req, res) => {
  try {
    const { paymentMethod, phoneNumber, items, createBy, voucherCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
    }

    // Tính tổng tiền ban đầu của hóa đơn
    let totalAmount = items.reduce((acc, item) => acc + (item.currentPrice * item.quantity), 0);
    let discount = 0; // Mức giảm giá sẽ được tính toán dựa trên voucher

    // Kiểm tra và áp dụng voucher nếu có
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode, isActive: true });
      if (!voucher) {
        return res.status(400).json({ message: 'Voucher không hợp lệ hoặc đã hết hạn.' });
      }

      // Tính mức giảm giá dựa trên loại voucher
      if (voucher.type === "BuyXGetY") {
        discount = await applyBuyXGetYDiscount(voucher, items);
      } else if (voucher.type === "FixedDiscount") {
        discount = await applyFixedDiscount(voucher, totalAmount);
      } else if (voucher.type === "PercentageDiscount") {
        discount = await applyPercentageDiscount(voucher, totalAmount);
      }

      // Điều chỉnh tổng tiền với mức giảm giá
      totalAmount -= discount;
    }

    // Tạo hóa đơn mới với thông tin đã áp dụng khuyến mãi
    const bill = new Bill({
      user: null, // Mua hàng trực tiếp không yêu cầu ID người dùng
      items,
      totalAmount,
      paymentMethod,
      phoneNumber: phoneNumber || '',
      status: 'Paid',
      purchaseType: 'Offline',
      createBy,
      discountAmount: discount, // Thêm mức giảm giá vào hóa đơn
    });

    await bill.save();

    // Kiểm tra và cập nhật tồn kho
    for (const item of items) {
      const stock = await Stock.findOne({ productId: item.product, unit: item.unit });

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${item.product} không đủ số lượng tồn kho cho đơn vị ${item.unit}.`
        });
      }

      stock.quantity -= item.quantity;
      await stock.save();
    }

    res.status(201).json({ message: 'Hóa đơn đã được tạo thành công', bill });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: error.message });
  }
};

// Hàm áp dụng voucher BuyXGetY
async function applyBuyXGetYDiscount(voucher, items) {
  const condition = await BuyXGetYVoucher.findOne({ voucherId: voucher._id });
  if (!condition) return 0;

  const eligibleItem = items.find((item) => item.product.toString() === condition.productXId.toString());
  if (eligibleItem && eligibleItem.quantity >= condition.quantityX) {
    const freeItems = Math.floor(eligibleItem.quantity / condition.quantityX) * condition.quantityY;
    const productY = items.find((item) => item.product.toString() === condition.productYId.toString());
    return productY ? productY.currentPrice * freeItems : 0;
  }
  return 0;
}

// Hàm áp dụng voucher FixedDiscount
// Updated applyFixedDiscount function
async function applyFixedDiscount(voucher, totalAmount) {
  const condition = await FixedDiscountVoucher.findOne({ voucherId: voucher._id });
  if (condition && totalAmount >= condition.conditions[0].minOrderValue) {
    return condition.conditions[0].discountAmount;
  }
  return 0; 
}


// Hàm áp dụng voucher PercentageDiscount
async function applyPercentageDiscount(voucher, totalAmount) {
  const condition = await PercentageDiscountVoucher.findOne({ voucherId: voucher._id });

  if (condition && totalAmount >= condition.conditions[0].minOrderValue) {
    const discount = (totalAmount * condition.conditions[0].discountPercentage) / 100;
    return discount > condition.conditions[0].maxDiscountAmount ? condition.conditions[0].maxDiscountAmount : discount;
  }
  return 0;
}

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
// Lấy danh sách tất cả hóa đơn
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate('items.product'); 
    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: 'Không có hóa đơn nào' });
    }
    res.status(200).json(bills); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Lấy danh sách hóa đơn mua trực tuyến
exports.getOnlineBills = async (req, res) => {
  try {
    const bills = await Bill.find({ purchaseType: 'Online' }).populate('items.product');
    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: 'Không có hóa đơn mua trực tuyến nào' });
    }
    res.status(200).json(bills); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//mua hàng trực tiếp
exports.getOfflineBills = async (req, res) => {
  try {
    const bills = await Bill.find({ purchaseType: 'Offline' }).populate('items.product');
    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: 'Không có hóa đơn mua trực tuyến nào' });
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
