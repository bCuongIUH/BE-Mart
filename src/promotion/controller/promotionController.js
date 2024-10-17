const mongoose = require('mongoose');
const Promotion = require('../models/promotionModel');
const FixedDiscount = require('../models/fixedDiscountSchema');
const PercentageDiscount = require('../models/percentageDiscountSchema ');
const BuyXGetY = require('../models/buyXGetYSchema');



// Tạo chương trình khuyến mãi mới hít đờ

exports.createPromotionHeader = async (req, res) => {
  try {
    const { code, name, startDate, endDate } = req.body;

    // Tạo header thong tin chung
    const promotionHeader = new Promotion({ code, name, startDate, endDate });
    await promotionHeader.save();

    res.status(201).send({ message: 'Tạo thông tin chung bảng giá thành công', promotionHeader });
  } catch (error) {
    res.status(500).send({ error: 'Có lỗi xảy ra', details: error.message });
    console.error('Có lỗi xảy ra:', error);
  }
};

// khai báoo
const validTypes = ['fixed_discount', 'percentage_discount', 'buy_x_get_y'];
// thêm detail
exports.addPromotionTypes = async (req, res) => {
  try {
    const { promotionId, promotionTypes } = req.body;

    // Tìm kiếm header đã tạo
    const promotionHeader = await Promotion.findById(promotionId);
    console.log(promotionId);
    
    if (!promotionHeader) {
      return res.status(404).send({ message: 'Không tìm thấy chương trình khuyến mãi' });
    }

    // Duyệt qua tất cả các loại 
    for (const promo of promotionTypes) {
      const { type, details } = promo;

      if (!validTypes.includes(type)) {
        return res.status(400).send({ message: `Loại khuyến mãi không hợp lệ: ${type}` });
      }

      let promotionType;
      if (type === 'fixed_discount') {
        promotionType = new FixedDiscount({
          promotionId,
          conditions: details.conditions 
        });
      } else if (type === 'percentage_discount') {
        promotionType = new PercentageDiscount({
          promotionId,
          conditions: details.conditions 
        });
      } else if (type === 'buy_x_get_y') {
        promotionType = new BuyXGetY({
          promotionId,
          conditions: details.conditions 
        });
      }
      await promotionType.save();
    }

    res.status(201).send({ message: 'Thêm các loại khuyến mãi thành công' });
  } catch (error) {
    res.status(500).send({ error: 'Lỗi khi thêm loại khuyến mãi', details: error.message });
    console.error('Lỗi khi thêm loại khuyến mãi:', error);
  }
};
















// 
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

