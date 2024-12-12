const axios = require('axios');
const crypto = require('crypto');
const Bill = require('../models/billModel');
const Cart = require('../../cart/model/cart');
const Product = require('../../products/models/product');
const Stock = require('../../warehouse/models/Stock');
const Voucher = require('../../promotion/models/Voucher');
const FixedDiscountVoucher = require('../../promotion/models/FixedDiscountVoucher');
const PercentageDiscountVoucher = require('../../promotion/models/PercentageDiscountVoucher');
const BuyXGetYVoucher = require('../../promotion/models/BuyXGetYVoucher');
const Transaction = require('../../warehouse/models/Transaction');
const mongoose = require("mongoose");
const Customer = require('../../customer/models/Customer');

// Tạo hóa đơn từ giỏ hàng 


// exports.createBill = async (req, res) => {
//   try {
//     const { customerId, paymentMethod, itemIds, voucherCode } = req.body;

//     if (!customerId || !paymentMethod || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
//       return res.status(400).json({
//         message: "Thiếu thông tin khách hàng, phương thức thanh toán hoặc sản phẩm được chọn.",
//       });
//     }

//     // Tìm giỏ hàng của khách hàng
//     const cart = await Cart.findOne({ customer: customerId }).populate("items.product");

//     if (!cart || cart.items.length === 0) {
//       return res.status(404).json({
//         message: "Giỏ hàng trống hoặc không có sản phẩm nào để thanh toán.",
//       });
//     }

//     // Chuyển đổi dữ liệu items cho phù hợp
//     const items = cart.items.map((item) => ({
//       product: item.product._id.toString(), // Chỉ lấy ID sản phẩm
//       unit: item.unit.toString(), // ID của đơn vị
//       quantity: item.quantity,
//       currentPrice: item.product.currentPrice,
//     }));

//     // Lọc các sản phẩm có trạng thái "ChoThanhToan" và được chọn để thanh toán
//     const itemsToBill = cart.items.filter(
//       (item) => itemIds.includes(item._id.toString()) && item.status === "ChoThanhToan"
//     );

//     if (itemsToBill.length === 0) {
//       return res.status(400).json({
//         message: "Không có sản phẩm nào được chọn hoặc đã được thanh toán trước đó.",
//       });
//     }

//     // Tính tổng tiền của các sản phẩm đã chọn
//     let totalAmount = itemsToBill.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

//     // Áp dụng voucher nếu có
//     let discount = 0;
//     let appliedVoucher = null;
//     if (voucherCode) {
//       const voucher = await Voucher.findOne({ code: voucherCode, isActive: true });
//       if (!voucher) {
//         return res.status(400).json({ message: "Voucher không hợp lệ hoặc đã hết hạn." });
//       }

//       if (voucher.type === "BuyXGetY") {
//         discount = await applyBuyXGetYDiscount(voucher, items);
//       } else if (voucher.type === "FixedDiscount") {
//         discount = await applyFixedDiscount(voucher, totalAmount);
//       } else if (voucher.type === "PercentageDiscount") {
//         discount = await applyPercentageDiscount(voucher, totalAmount);
//       }

//       totalAmount -= discount;
//       appliedVoucher = voucher._id; // Lưu ID của voucher
//     }

//     // Tạo hóa đơn mới
//     const bill = new Bill({
//       customer: customerId,
//       items: itemsToBill,
//       totalAmount,
//       paymentMethod,
//       purchaseType: "Online",
//       discountAmount: discount,
//       appliedVoucher: appliedVoucher, // Lưu ID voucher
//       appliedVoucherCode: voucherCode || null, // Lưu mã voucher
//     });

//     await bill.save();

//     // Trừ số lượng tồn kho và ghi lại giao dịch cho từng sản phẩm
//     for (const item of itemsToBill) {
//       const stock = await Stock.findOne({
//         productId: item.product._id,
//         unit: item.unit,
//       });

//       if (!stock || stock.quantity < item.quantity) {
//         return res.status(400).json({
//           message: `Sản phẩm ${item.product.name} không đủ số lượng tồn kho.`,
//         });
//       }

//       stock.quantity -= item.quantity;
//       await stock.save();

//       const transaction = new Transaction({
//         productId: item.product._id,
//         transactionType: "ban",
//         quantity: item.quantity,
//         unit: item.unit,
//         date: new Date(),
//         isDeleted: false,
//       });

//       await transaction.save();
//     }

//     // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
//     cart.items = cart.items.filter((item) => !itemIds.includes(item._id.toString()));
//     await cart.save();

//     // Phản hồi lại với thông tin hóa đơn và voucher
//     res.status(201).json({
//       message: "Hóa đơn đã được tạo thành công và các sản phẩm đã được xóa khỏi giỏ hàng",
//       bill,
//       appliedVoucherId: appliedVoucher,
//       appliedVoucherCode: voucherCode,
//     });
//   } catch (error) {
//     console.error("Lỗi:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
exports.createBill = async (req, res) => {
  try {
    const { customerId, paymentMethod, itemIds, voucherCodes = [] } = req.body;

    // Kiểm tra dữ liệu đầu vào
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
      (item) => itemIds.includes(item._id.toString()) && item.status === "ChoThanhToan"
    );

    if (itemsToBill.length === 0) {
      return res.status(400).json({
        message: "Không có sản phẩm nào được chọn hoặc đã được thanh toán trước đó.",
      });
    }

    // Tính tổng tiền của các sản phẩm đã chọn
    let totalAmount = itemsToBill.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
    let discount = 0;
    let appliedVouchers = [];
    let giftItems = [];

    console.log("Items to bill:", itemsToBill.map(item => ({
      productId: item.product._id.toString(),
      unit: item.unit,
      quantity: item.quantity,
    })));

    // Xử lý từng voucher
    for (const code of voucherCodes) {
      const voucher = await Voucher.findOne({ code, isActive: true, isDeleted: false });
      if (!voucher) {
        console.log(`Voucher ${code} không hợp lệ hoặc đã hết hạn.`);
        continue;
      }

      if (voucher.type === "BuyXGetY") {
        const result = await applyBuyXGetYDiscountApp(voucher, itemsToBill); // Truyền đúng itemsToBill
        console.log("Result from applyBuyXGetYDiscount:", result);
        if (result.gifts.length > 0) {
          giftItems = [...giftItems, ...result.gifts];
          appliedVouchers.push({ code, type: voucher.type });
        }
      } else if (voucher.type === "FixedDiscount" || voucher.type === "PercentageDiscount") {
        const voucherDiscount = voucher.type === "FixedDiscount"
          ? await applyFixedDiscount(voucher, totalAmount)
          : await applyPercentageDiscount(voucher, totalAmount);

        if (voucherDiscount > 0) {
          discount += voucherDiscount;
          appliedVouchers.push({ code, type: voucher.type });
        }
      }
    }

    totalAmount -= discount;

    // Kiểm tra tồn kho cho các sản phẩm đã chọn
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
    }

    // Trừ tồn kho và ghi lại giao dịch
    for (const item of itemsToBill) {
      const stock = await Stock.findOne({
        productId: item.product._id,
        unit: item.unit,
      });

      stock.quantity -= item.quantity;
      await stock.save();

      const transaction = new Transaction({
        productId: item.product._id,
        transactionType: "ban",
        quantity: item.quantity,
        unit: item.unit,
        date: new Date(),
        isDeleted: false,
      });

      await transaction.save();
    }

    // Tạo hóa đơn mới
    const bill = new Bill({
      customer: customerId,
      items: itemsToBill,
      totalAmount,
      paymentMethod,
      purchaseType: "Online",
      discountAmount: discount,
      appliedVouchers,
      giftItems,
      status: "HoanThanh", // Trạng thái mặc định
    });

    await bill.save();

    // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
    cart.items = cart.items.filter((item) => !itemIds.includes(item._id.toString()));
    await cart.save();

    res.status(201).json({
      message: "Hóa đơn đã được tạo thành công và các sản phẩm đã được xóa khỏi giỏ hàng",
      bill,
      appliedVouchers,
      giftItems,
    });
  } catch (error) {
    console.error("Lỗi:", error.message);
    res.status(500).json({ message: "Đã xảy ra lỗi không mong muốn, vui lòng thử lại." });
  }
};



// Tạo hóa đơn mua trực tiếp


// exports.createDirectPurchaseBill = async (req, res) => {
//   try {
//     const { paymentMethod, phoneNumber, items, createBy, voucherCodes = [], customerId } = req.body;
//     console.log("Payload từ FE:", req.body);

//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
//     }

//     if (!Array.isArray(voucherCodes)) {
//       return res.status(400).json({ message: 'voucherCodes phải là mảng hợp lệ' });
//     }

//     let customer;

//     // Kiểm tra khách hàng
//     if (customerId) {
//       // Lấy thông tin khách hàng từ `customerId`
//       customer = await Customer.findById(customerId);
//       if (!customer) {
//         return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
//       }
//     } else if (phoneNumber) {
//       // Tìm khách hàng theo số điện thoại
//       customer = await Customer.findOne({ phoneNumber });

//       if (!customer) {
//         // Nếu khách hàng không tồn tại, tạo khách hàng mới với số điện thoại
//         customer = new Customer({
//           fullName: 'Khách vãng lai', // Tên mặc định
//           phoneNumber,
//           joinDate: Date.now(),
//           isRegistered: false, // Khách chưa có tài khoản
//         });
//         await customer.save();
//       }
//     } else {
//       return res.status(400).json({ message: 'Số điện thoại là bắt buộc đối với khách hàng chưa có tài khoản' });
//     }

//     // Tính toán tổng số tiền và giảm giá
//     let totalAmount = items.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
//     let discount = 0;
//     let appliedVouchers = [];
//     let giftItems = [];

//     for (const code of voucherCodes) {
//       const voucher = await Voucher.findOne({ code, isActive: true, isDeleted: false });
//       if (!voucher) {
//         console.log(`Voucher ${code} không hợp lệ hoặc đã hết hạn.`);
//         continue;
//       }

//       if (voucher.type === "BuyXGetY") {
//         const result = await applyBuyXGetYDiscount(voucher, items);
//         if (result.gifts.length > 0) {
//           giftItems = [...giftItems, ...result.gifts];
//           appliedVouchers.push({ code, type: voucher.type });
//         }
//       } else if (voucher.type === "FixedDiscount" || voucher.type === "PercentageDiscount") {
//         const voucherDiscount = voucher.type === "FixedDiscount"
//           ? await applyFixedDiscount(voucher, totalAmount)
//           : await applyPercentageDiscount(voucher, totalAmount);

//         if (voucherDiscount > 0) {
//           discount += voucherDiscount;
//           appliedVouchers.push({ code, type: voucher.type });
//         }
//       }
//     }

//     totalAmount -= discount;

//     // Kiểm tra tồn kho
//     const stockList = await Stock.find({
//       productId: { $in: items.map(item => item.product) },
//       unit: { $in: items.map(item => item.unit) },
//     });

//     for (const item of items) {
//       const stock = stockList.find(
//         (s) => s.productId.toString() === item.product && s.unit === item.unit
//       );

//       const product = await Product.findOne({ _id: item.product });
//       const productName = product ? product.name : "Không xác định";

//       if (!stock || stock.quantity < item.quantity) {
//         return res.status(400).json({
//           message: `Sản phẩm "${productName}" với đơn vị "${item.unit}" không đủ số lượng tồn kho.`,
//         });
//       }
//     }

//     // Trừ tồn kho và ghi lại giao dịch
//     for (const item of items) {
//       const stock = await Stock.findOne({
//         productId: item.product,
//         unit: item.unit,
//       });

//       stock.quantity -= item.quantity;
//       await stock.save();

//       const transactionType = item.currentPrice === 0 ? "khuyenmai" : "ban";

//       const transaction = new Transaction({
//         productId: item.product,
//         transactionType,
//         quantity: item.quantity,
//         unit: item.unit,
//         date: new Date(),
//         isDeleted: false,
//       });

//       await transaction.save();
//     }

//     // Tạo hóa đơn
//     const bill = new Bill({
//       customer: customer._id,
//       items,
//       totalAmount,
//       paymentMethod,
//       phoneNumber: phoneNumber || customer.phoneNumber, // Lưu số điện thoại nếu có
//       purchaseType: 'Offline',
//       createBy,
//       discountAmount: discount,
//       appliedVouchers,
//       giftItems,
//       status: 'HoanThanh', // Mặc định trạng thái là 'HoanThanh'
//     });

//     await bill.save();

//     res.status(201).json({
//       message: 'Hóa đơn đã được tạo thành công',
//       bill,
//       appliedVouchers,
//       giftItems,
//     });
//   } catch (error) {
//     console.error("Lỗi:", error.message);
//     res.status(500).json({ message: "Đã xảy ra lỗi không mong muốn, vui lòng thử lại." });
//   }
// };

exports.createDirectPurchaseBill = async (req, res) => {
  try {
    const {
      paymentMethod,
      phoneNumber,
      items,
      createBy,
      voucherCodes = [],
      customerId,
      status,
      orderCode,
    } = req.body;
    console.log("Payload từ FE:", req.body);

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách sản phẩm không hợp lệ" });
    }

    if (!Array.isArray(voucherCodes)) {
      return res
        .status(400)
        .json({ message: "voucherCodes phải là mảng hợp lệ" });
    }

    let customer;

    // Kiểm tra khách hàng
    if (customerId) {
      // Lấy thông tin khách hàng từ `customerId`
      customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy thông tin khách hàng" });
      }
    } else if (phoneNumber) {
      // Tìm khách hàng theo số điện thoại
      customer = await Customer.findOne({ phoneNumber });

      if (!customer) {
        // Nếu khách hàng không tồn tại, tạo khách hàng mới với số điện thoại
        customer = new Customer({
          fullName: "Khách vãng lai", // Tên mặc định
          phoneNumber,
          joinDate: Date.now(),
          isRegistered: false, // Khách chưa có tài khoản
        });
        await customer.save();
      }
      if (status === "ChuaThanhToan") {
        return res
          .status(400)
          .json({ message: "Không thể tạo giao dịch với hóa đơn chưa thanh toán" });
      }
    } else {
      return res.status(400).json({
        message:
          "Số điện thoại là bắt buộc đối với khách hàng chưa có tài khoản",
      });
    }

    // Tính toán tổng số tiền và giảm giá
    let totalAmount = items.reduce(
      (acc, item) => acc + item.currentPrice * item.quantity,
      0
    );
    let discount = 0;
    let appliedVouchers = [];
    let giftItems = [];

    for (const code of voucherCodes) {
      const voucher = await Voucher.findOne({
        code,
        isActive: true,
        isDeleted: false,
      });
      if (!voucher) {
        console.log(`Voucher ${code} không hợp lệ hoặc đã hết hạn.`);
        continue;
      }

      if (voucher.type === "BuyXGetY") {
        const result = await applyBuyXGetYDiscount(voucher, items);
        if (result.gifts.length > 0) {
          giftItems = [...giftItems, ...result.gifts];
          appliedVouchers.push({ code, type: voucher.type });
        }
      } else if (
        voucher.type === "FixedDiscount" ||
        voucher.type === "PercentageDiscount"
      ) {
        const voucherDiscount =
          voucher.type === "FixedDiscount"
            ? await applyFixedDiscount(voucher, totalAmount)
            : await applyPercentageDiscount(voucher, totalAmount);

        if (voucherDiscount > 0) {
          discount += voucherDiscount;
          appliedVouchers.push({ code, type: voucher.type });
        }
      }
    }

    totalAmount -= discount;

    // Kiểm tra tồn kho
    const stockList = await Stock.find({
      productId: { $in: items.map((item) => item.product) },
      unit: { $in: items.map((item) => item.unit) },
    });

    for (const item of items) {
      const stock = stockList.find(
        (s) => s.productId.toString() === item.product && s.unit === item.unit
      );

      const product = await Product.findOne({ _id: item.product });
      const productName = product ? product.name : "Không xác định";

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm "${productName}" với đơn vị "${item.unit}" không đủ số lượng tồn kho.`,
        });
      }
    }

    // Trừ tồn kho và ghi lại giao dịch
    for (const item of items) {
      const stock = await Stock.findOne({
        productId: item.product,
        unit: item.unit,
      });

      stock.quantity -= item.quantity;
      await stock.save();

      const transactionType = item.currentPrice === 0 ? "khuyenmai" : "ban";

      const transaction = new Transaction({
        productId: item.product,
        transactionType,
        quantity: item.quantity,
        unit: item.unit,
        date: new Date(),
        isDeleted: false,
      });

      await transaction.save();
    }

    // Tạo hóa đơn
    const bill = new Bill({
      customer: customer._id,
      items,
      totalAmount,
      paymentMethod,
      phoneNumber: phoneNumber || customer.phoneNumber, // Lưu số điện thoại nếu có
      purchaseType: "Offline",
      createBy,
      discountAmount: discount,
      appliedVouchers,
      giftItems,
      orderCode,
      status: status || "HoanThanh",
    });

    await bill.save();

    res.status(201).json({
      message: "Hóa đơn đã được tạo thành công",
      bill,
      appliedVouchers,
      giftItems,
    });
  } catch (error) {
    console.error("Lỗi:", error.message);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi không mong muốn, vui lòng thử lại." });
  }
};
// hàm áp dụng km cho mobile
async function applyBuyXGetYDiscountApp(voucher, items) {
  const condition = await BuyXGetYVoucher.findOne({ voucherId: voucher._id });
  if (!condition) {

    return { discountAmount: 0, gifts: [] };
  }
  const productXId = condition.conditions[0].productXId.toString();
  const unitX = condition.conditions[0].unitX;
  const quantityX = condition.conditions[0].quantityX;

 
  const eligibleItemX = items.find(
    (item) =>
      item.product._id.toString() === productXId &&
      item.unit === unitX &&
      item.quantity >= quantityX
  );
  if (!eligibleItemX) {
 
    return { discountAmount: 0, gifts: [] };
  }
  const freeItemsCount = Math.floor(eligibleItemX.quantity / quantityX) * condition.conditions[0].quantityY;

  if (freeItemsCount === 0) {
    return { discountAmount: 0, gifts: [] };
  }
  const productYId = condition.conditions[0].productYId.toString();
  const unitY = condition.conditions[0].unitY;
  const gifts = [
    {
      product: productYId,
      quantity: freeItemsCount,
      unit: unitY,
    },
  ];

  console.log("Gift items:", gifts);

  return { discountAmount: 0, gifts };
}



// Hàm áp dụng voucher BuyXGetY
async function applyBuyXGetYDiscount(voucher, items) {
  const condition = await BuyXGetYVoucher.findOne({ voucherId: voucher._id });
  if (!condition) {
    console.log("Condition not found for voucher:", voucher._id);
    return { discountAmount: 0, gifts: [] };
  }

  console.log("Condition found:", condition);

  const productX = await Product.findById(condition.conditions[0].productXId);
  const productY = await Product.findById(condition.conditions[0].productYId);

  if (!productX || !productY) {
    console.log("Product X or Y not found");
    return { discountAmount: 0, gifts: [] };
  }

  const eligibleItemX = items.find(
    (item) =>
      item.product.toString() === condition.conditions[0].productXId.toString() &&
      item.unit === condition.conditions[0].unitX &&
      item.quantity >= condition.conditions[0].quantityX
  );

  if (!eligibleItemX) {
    console.log("Eligible item X not found or insufficient quantity");
    return { discountAmount: 0, gifts: [] };
  }

  const freeItemsCount = Math.floor(eligibleItemX.quantity / condition.conditions[0].quantityX) * condition.conditions[0].quantityY;

  if (freeItemsCount === 0) {
    console.log("No free items calculated");
    return { discountAmount: 0, gifts: [] };
  }

  // Kiểm tra đơn vị (unitY)
  if (!condition.conditions[0].unitY) {
    console.warn(`Unit for product Y is missing in voucher ${voucher.code}`);
    return { discountAmount: 0, gifts: [] };
  }

  const gifts = [
    {
      product: condition.conditions[0].productYId,
      quantity: freeItemsCount,
      unit: condition.conditions[0].unitY, // Đảm bảo unit được lấy từ điều kiện
    },
  ];

  // console.log("Gift items:", gifts);

  return { discountAmount: 0, gifts };
}




// Hàm áp dụng voucher FixedDiscount
async function applyFixedDiscount(voucher, totalAmount) {
  const condition = await FixedDiscountVoucher.findOne({ voucherId: voucher._id });
  if (condition && totalAmount >= condition.conditions[0].minOrderValue) {
    console.log(`Áp dụng mã giảm giá cố định: ${voucher.code}`);
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
    const bills = await Bill.find({
      purchaseType: 'Online',
      isDeleted: false,
      // status: { $ne: 'HoanTra' } 
    })
    .populate('items.product')
    .populate('customer');

    res.status(200).json(bills); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getOnlineBillsThongKe = async (req, res) => {
  try {
    const bills = await Bill.find({
      purchaseType: 'Online',
      isDeleted: false,
      status: { $ne: 'HoanTra' } 
    })
    .populate('items.product')
    .populate('customer');

    res.status(200).json(bills); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//mua hàng trực tiếp
exports.getOfflineBills = async (req, res) => {
  try {
    const bills = await Bill.find({ purchaseType: 'Offline' , status: { $ne: 'ChuaThanhToan' } }).populate('items.product');
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
//update chothanhtoan -> hoanthanh của vnpay
exports.updateBillStatusByCode = async (req, res) => {
  try {
    const { orderCode, status } = req.body;

    if (!orderCode || !status) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp mã đơn hàng và trạng thái" });
    }

    // Tìm hóa đơn theo mã đơn hàng (orderCode)
    const bill = await Bill.findOne({ orderCode });
    if (!bill) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    // Cập nhật trạng thái
    bill.status = status;
    await bill.save();

    res
      .status(200)
      .json({ message: "Trạng thái hóa đơn đã được cập nhật", bill });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái hóa đơn:", error);
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


//hoàn trả bill ở web offline
exports.returnPurchaseBill = async (req, res) => {
  try {
    const { billId, returnedItems } = req.body;

    if (!billId) {
      return res.status(400).json({ message: 'Thiếu thông tin billId' });
    }

    // Tìm hóa đơn
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    if (bill.purchaseType !== 'Offline') {
      return res.status(400).json({ message: 'Chỉ hỗ trợ hoàn trả hóa đơn Offline' });
    }

    if (bill.status === 'HoanTra') {
      return res.status(400).json({ message: 'Hóa đơn đã được hoàn trả trước đó' });
    }

    // Kiểm tra thời gian hoàn trả trong vòng 24 giờ
    const currentTime = new Date();
    const billCreationTime = new Date(bill.createdAt);
    const timeDifference = currentTime - billCreationTime;

    if (timeDifference > 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        message: 'Chỉ có thể hoàn trả hóa đơn trong vòng 24 giờ kể từ thời gian thanh toán',
      });
    }

    // Lấy danh sách items từ hóa đơn gốc
    const { items } = bill;

    // Duyệt qua từng item để hoàn trả
    for (const item of items) {
      const stock = await Stock.findOne({
        productId: item.product,
        unit: item.unit,
      });

      if (!stock) {
        return res.status(400).json({
          message: `Không tìm thấy tồn kho cho sản phẩm ID: ${item.product}`,
        });
      }

      // Cộng lại số lượng vào tồn kho
      stock.quantity += item.quantity;
      await stock.save();

      // Ghi lại giao dịch hoàn trả
      const transaction = new Transaction({
        productId: item.product,
        transactionType: 'hoantra',
        quantity: item.quantity,
        unit: item.unit,
        date: new Date(),
        isDeleted: false,
      });

      await transaction.save();
    }

    // Cập nhật trạng thái hóa đơn
    bill.status = 'HoanTra';
    await bill.save();

    res.status(200).json({
      message: 'Hóa đơn đã được hoàn trả thành công',
      bill,
    });
  } catch (error) {
    console.error('Lỗi:', error.message);
    res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại' });
  }
};
