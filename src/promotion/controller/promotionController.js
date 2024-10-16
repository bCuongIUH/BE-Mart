// const mongoose = require('mongoose');
// const Promotion = require('../models/promotionModel');

// // Lấy danh sách tất cả các chương trình khuyến mãi
// exports.getAllPromotions = async (req, res) => {
//     try {
//         const promotions = await Promotion.find();
//         res.status(200).json(promotions);
//     } catch (error) {
//         res.status(500).json({ message: 'Lỗi khi lấy danh sách khuyến mãi', error });
//     }
// };

// // Thêm chương trình khuyến mãi mới
// exports.createPromotion = async (req, res) => {
//   const { code, description, discountType } = req.body;

//   try {
//     // Tạo một chương trình khuyến mãi mới chỉ với phần header
//     const newPromotion = new Promotion({
//       code,
//       description,
//       discountType,
//       //conditions: conditions || [] 
//     });

//     await newPromotion.save();
//     res.status(201).json({ message: "Chương trình khuyến mãi được tạo thành công", promotion: newPromotion });
//   } catch (error) {
//     res.status(400).json({ message: "Lỗi khi tạo chương trình khuyến mãi", error: error.message });
//   }
// };

// // Cập nhật chi tiết chương trình khuyến mãi
// exports.updatePromotion = async (req, res) => {
//   const { id } = req.params;
//   const conditions = req.body; 

//   try {
//     const promotion = await Promotion.findById(id);

//     if (!promotion) {
//       return res.status(404).json({ message: "Không tìm thấy chương trình khuyến mãi" });
//     }

//     // Cập nhật phần conditions
//     promotion.conditions = conditions; 
//     await promotion.save();

//     res.status(200).json({ message: "Điều kiện khuyến mãi đã được cập nhật thành công", promotion });
//   } catch (error) {
//     res.status(400).json({ message: "Lỗi khi cập nhật điều kiện khuyến mãi", error: error.message });
//   }
// };

// // Xóa chương trình khuyến mãi
// exports.deletePromotion = async (req, res) => {
//     const promotionId = req.params.id;

//     try {
//         const deletedPromotion = await Promotion.findByIdAndDelete(promotionId);

//         if (!deletedPromotion) {
//             return res.status(404).json({ message: 'Không tìm thấy chương trình khuyến mãi' });
//         }

//         res.status(200).json({ message: 'Xóa khuyến mãi thành công', deletedPromotion });
//     } catch (error) {
//         res.status(500).json({ message: 'Lỗi khi xóa khuyến mãi', error });
//     }
// };
const mongoose = require('mongoose');
const Promotion = require('../models/promotionModel');
const FixedDiscount = require('../models/fixedDiscountSchema');
const PercentageDiscount = require('../models/percentageDiscountSchema ');
const BuyXGetY = require('../models/buyXGetYSchema');

// Tạo chương trình khuyến mãi mới
exports.createPromotion = async (req, res) => {
  try {
    const { name, description, code, type, startDate, endDate, amount, details } = req.body;

    // Tạo chương trình khuyến mãi
    const promotion = new Promotion({ name, description, code, type, startDate, endDate, amount });
    await promotion.save();

    // Lưu khuyến mãi theo loại
    if (type === 'fixed_discount') {
      const fixedDiscount = new FixedDiscount({ promotionId: promotion._id, discountAmount: details.discountAmount });
      await fixedDiscount.save();
    } else if (type === 'percentage_discount') {
      const percentageDiscount = new PercentageDiscount({
        promotionId: promotion._id,
        discountPercentage: details.discountPercentage,
        maxDiscountAmount: details.maxDiscountAmount
      });
      await percentageDiscount.save();
    } else if (type === 'buy_x_get_y') {
      const buyXGetY = new BuyXGetY({
        promotionId: promotion._id,
        productXId: details.productXId,
        quantityX: details.quantityX,
        productYId: details.productYId,
        quantityY: details.quantityY
      });
      await buyXGetY.save();
    }

    res.status(201).send({ message: 'Chương trình khuyến mãi được tạo thành công', promotion });
  } catch (error) {
    res.status(500).send({ error: 'Lỗi tạo chương trình khuyến mãi', details: error.message });
    console.error('Error creating promotion:', error);
  }
};

// Lấy danh sách tất cả chương trình khuyến mãi
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.status(200).send(promotions);
  } catch (error) {
    res.status(500).send({ error: 'Lỗi khi lấy danh sách khuyến mãi', details: error.message });
  }
};

// Lấy thông tin chi tiết chương trình khuyến mãi theo id
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).send({ error: 'Không tìm thấy chương trình khuyến mãi' });
    }
    res.status(200).send(promotion);
  } catch (error) {
    res.status(500).send({ error: 'Lỗi khi lấy thông tin khuyến mãi', details: error.message });
  }
};

// Cập nhật chương trình khuyến mãi
exports.updatePromotion = async (req, res) => {
  try {
    const { name, description, code, type, startDate, endDate, amount, details } = req.body;

    // Cập nhật thông tin chương trình khuyến mãi
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, {
      name, description, code, type, startDate, endDate, amount
    }, { new: true });

    if (!promotion) {
      return res.status(404).send({ error: 'Không tìm thấy chương trình khuyến mãi' });
    }

    // Cập nhật chi tiết theo loại khuyến mãi
    if (type === 'fixed_discount') {
      await FixedDiscount.findOneAndUpdate({ promotionId: promotion._id }, { discountAmount: details.discountAmount });
    } else if (type === 'percentage_discount') {
      await PercentageDiscount.findOneAndUpdate({ promotionId: promotion._id }, {
        discountPercentage: details.discountPercentage,
        maxDiscountAmount: details.maxDiscountAmount
      });
    } else if (type === 'buy_x_get_y') {
      await BuyXGetY.findOneAndUpdate({ promotionId: promotion._id }, {
        productXId: details.productXId,
        quantityX: details.quantityX,
        productYId: details.productYId,
        quantityY: details.quantityY
      });
    }

    res.status(200).send({ message: 'Cập nhật thành công', promotion });
  } catch (error) {
    res.status(500).send({ error: 'Lỗi khi cập nhật khuyến mãi', details: error.message });
  }
};

// Xóa chương trình khuyến mãi
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).send({ error: 'Không tìm thấy chương trình khuyến mãi để xóa' });
    }

    // Xóa chi tiết theo loại khuyến mãi
    if (promotion.type === 'fixed_discount') {
      await FixedDiscount.findOneAndDelete({ promotionId: promotion._id });
    } else if (promotion.type === 'percentage_discount') {
      await PercentageDiscount.findOneAndDelete({ promotionId: promotion._id });
    } else if (promotion.type === 'buy_x_get_y') {
      await BuyXGetY.findOneAndDelete({ promotionId: promotion._id });
    }

    res.status(200).send({ message: 'Xóa thành công chương trình khuyến mãi' });
  } catch (error) {
    res.status(500).send({ error: 'Lỗi khi xóa khuyến mãi', details: error.message });
  }
};

