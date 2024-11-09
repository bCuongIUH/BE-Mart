const Bill = require('../models/billModel');
const Cart = require('../../cart/model/cart');
const Product = require('../../products/models/product');
const Stock = require('../../warehouse/models/Stock');
const Voucher = require('../../promotion/models/Voucher');
const FixedDiscountVoucher = require('../../promotion/models/FixedDiscountVoucher');
const PercentageDiscountVoucher = require('../../promotion/models/PercentageDiscountVoucher');
const BuyXGetYVoucher = require('../../promotion/models/BuyXGetYVoucher');
const Transaction = require('../../warehouse/models/Transaction');

// Tạo hóa đơn từ giỏ hàng đã mua
//update ngày 10/7 
// exports.createBill = async (req, res) => {
//   try {
//     const { userId, paymentMethod } = req.body;

//     // Validate inputs
//     if (!userId || !paymentMethod) {
//       return res.status(400).json({
//         message: "Thiếu thông tin người dùng hoặc phương thức thanh toán.",
//       });
//     }

//     // Lấy giỏ hàng đang chờ thanh toán của người dùng
//     const cart = await Cart.findOne({
//       user: userId,
//       status: "ChoThanhToan",
//     }).populate("items.product");

//     // Kiểm tra nếu giỏ hàng tồn tại và có sản phẩm
//     if (!cart || cart.items.length === 0) {
//       return res.status(404).json({
//         message: "Giỏ hàng trống hoặc không có sản phẩm nào để thanh toán",
//       });
//     }

//     // Tính tổng tiền của hóa đơn
//     const totalAmount = cart.items.reduce(
//       (acc, item) => acc + (item.totalPrice || 0),
//       0
//     );

//     // Tạo hóa đơn mới
//     const bill = new Bill({
//       user: userId,
//       items: cart.items,
//       totalAmount,
//       paymentMethod,
//       purchaseType: "Online",
//     });

//     await bill.save();

//     // Trừ số lượng tồn kho theo đơn vị tính của mỗi sản phẩm
//     for (const item of cart.items) {
//       const stock = await Stock.findOne({
//         productId: item.product._id,
//         unit: item.unit,
//       });

//       // Kiểm tra nếu tồn kho đủ số lượng
//       if (!stock || stock.quantity < item.quantity) {
//         return res.status(400).json({
//           message: `Sản phẩm ${item.product.name} không đủ số lượng tồn kho.`,
//         });
//       }

//       // Trừ số lượng trong tồn kho
//       stock.quantity -= item.quantity;
//       await stock.save();
//     }

//     // Cập nhật trạng thái của giỏ hàng sau khi thanh toán
//     cart.status = "Shipped";
//     await cart.save();

//     res.status(201).json({ message: "Hóa đơn đã được tạo thành công", bill });
//   } catch (error) {
//     console.error("Lỗi:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
exports.createBill = async (req, res) => {
  try {
    const { customerId, paymentMethod, itemIds, voucherCode } = req.body;

    if (!customerId || !paymentMethod || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        message: "Thiếu thông tin khách hàng, phương thức thanh toán hoặc sản phẩm được chọn.",
      });
    }

    // Tìm giỏ hàng của khách hàng
    const cart = await Cart.findOne({ customer: customerId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        message: "Giỏ hàng trống hoặc không có sản phẩm nào để thanh toán.",
      });
    }

    // Lọc các sản phẩm có trạng thái "ChoThanhToan" và được chọn để thanh toán
    const itemsToBill = cart.items.filter(
      item => itemIds.includes(item._id.toString()) && item.status === "ChoThanhToan"
    );

    if (itemsToBill.length === 0) {
      return res.status(400).json({
        message: "Không có sản phẩm nào được chọn hoặc đã được thanh toán trước đó.",
      });
    }

    // Tính tổng tiền của các sản phẩm đã chọn
    let totalAmount = itemsToBill.reduce(
      (acc, item) => acc + (item.totalPrice || 0),
      0
    );

    // Áp dụng voucher nếu có
    let discount = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode, isActive: true });
      if (!voucher) {
        return res.status(400).json({ message: "Voucher không hợp lệ hoặc đã hết hạn." });
      }

      if (voucher.type === "BuyXGetY") {
        discount = await applyBuyXGetYDiscount(voucher, itemsToBill);
      } else if (voucher.type === "FixedDiscount") {
        discount = await applyFixedDiscount(voucher, totalAmount);
      } else if (voucher.type === "PercentageDiscount") {
        discount = await applyPercentageDiscount(voucher, totalAmount);
      }

      totalAmount -= discount;
    }

    // Tạo hóa đơn mới
    const bill = new Bill({
      customer: customerId,
      items: itemsToBill,
      totalAmount,
      paymentMethod,
      purchaseType: "Online",
      discountAmount: discount,
    });

    await bill.save();

    // Trừ số lượng tồn kho và ghi lại giao dịch cho từng sản phẩm
    for (const item of itemsToBill) {
      const stock = await Stock.findOne({
        productId: item.product._id,
        unit: item.unit,
      });

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${item.product.name} không đủ số lượng tồn kho.`,
        });
      }

      stock.quantity -= item.quantity;
      await stock.save();

      const transaction = new Transaction({
        productId: item.product._id,
        transactionType: 'ban',
        quantity: item.quantity,
        unit: item.unit,
        date: new Date(),
        isDeleted: false,
      });

      await transaction.save();
    }

    // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
    cart.items = cart.items.filter(item => !itemIds.includes(item._id.toString()));
    await cart.save();

    res.status(201).json({ message: "Hóa đơn đã được tạo thành công và các sản phẩm đã được xóa khỏi giỏ hàng", bill });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: error.message });
  }
};


//

exports.createDirectPurchaseBill = async (req, res) => {
  try {
    const { paymentMethod, phoneNumber, items, createBy, voucherCode, customerId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
    }

    let totalAmount = items.reduce((acc, item) => acc + (item.currentPrice * item.quantity), 0);
    let discount = 0;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode, isActive: true });
      if (!voucher) {
        return res.status(400).json({ message: 'Voucher không hợp lệ hoặc đã hết hạn.' });
      }

      if (voucher.type === "BuyXGetY") {
        discount = await applyBuyXGetYDiscount(voucher, items);
      } else if (voucher.type === "FixedDiscount") {
        discount = await applyFixedDiscount(voucher, totalAmount);
      } else if (voucher.type === "PercentageDiscount") {
        discount = await applyPercentageDiscount(voucher, totalAmount);
      }

      totalAmount -= discount;
    }

    const bill = new Bill({
      customer: customerId || null,
      items,
      totalAmount,
      paymentMethod,
      phoneNumber: phoneNumber || '',
      status: 'Paid',
      purchaseType: 'Offline',
      createBy,
      discountAmount: discount,
    
    });

    await bill.save();

    for (const item of items) {
      const stock = await Stock.findOne({ productId: item.product, unit: item.unit });

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${item.product} không đủ số lượng tồn kho cho đơn vị ${item.unit}.`
        });
      }

      stock.quantity -= item.quantity;
      await stock.save();

      // Ghi lại giao dịch vào bảng Transaction với transactionType là 'ban'
      const transaction = new Transaction({
        productId: item.product,
        transactionType: 'ban',
        quantity: item.quantity,
        unit: item.unit,
        date: new Date(),
        isdeleted: false,
      });

      await transaction.save();
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
