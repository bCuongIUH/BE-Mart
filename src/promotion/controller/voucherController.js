const Voucher = require("../models/Voucher");
const BuyXGetY = require("../models/BuyXGetYVoucher");
const FixedDiscount = require("../models/FixedDiscountVoucher");
const PercentageDiscount = require("../models/PercentageDiscountVoucher");
const FixedDiscountVoucher = require("../models/FixedDiscountVoucher");
const PercentageDiscountVoucher = require("../models/PercentageDiscountVoucher");
const PromotionProgram = require("../models/PromotionProgram");

exports.getVoucherByPromotionProgramId = async (req, res) => {
  try {
    const { promotionProgramId } = req.params;

    // Lấy danh sách voucher theo chương trình khuyến mãi
    const vouchers = await Voucher.find({
      // isActive: true,
      promotionProgram: promotionProgramId,
      isDeleted: false,
      
    });

    // Tạo một mảng promises để lấy điều kiện cho từng loại voucher
    const voucherDetails = await Promise.all(
      vouchers.map(async (voucher) => {
        let conditions = null;

        // Kiểm tra loại voucher và lấy conditions tương ứng
        switch (voucher.type) {
          case "BuyXGetY":
            conditions = await BuyXGetY.findOne({ voucherId: voucher._id });
            break;
          case "FixedDiscount":
            conditions = await FixedDiscount.findOne({
              voucherId: voucher._id,
            });
            break;
          case "PercentageDiscount":
            conditions = await PercentageDiscount.findOne({
              voucherId: voucher._id,
            });
            break;
          default:
            conditions = null;
        }

        // Trả về dữ liệu voucher cùng với conditions
        return {
          ...voucher._doc,
          conditions: conditions ? conditions.conditions : null,
        };
      })
    );

    res.status(200).json(voucherDetails);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi lấy danh sách voucher", details: error.message });
  }
};

// API: Tạo mới voucher
exports.createVoucher = async (req, res) => {
  try {
    const { code, promotionProgramId, type, isActive, conditions } = req.body;

    // Tạo voucher chính
    const newVoucher = new Voucher({
      code,
      promotionProgram: promotionProgramId,
      type,
      isActive : false,
    });

    await newVoucher.save();

    // Tạo các điều kiện liên quan theo từng loại voucher
    switch (type) {
      case "BuyXGetY":
        const buyXGetY = new BuyXGetY({
          voucherId: newVoucher._id,
          conditions, // conditions sẽ bao gồm productXId, quantityX, productYId, quantityY
        });
        await buyXGetY.save();
        break;

      case "FixedDiscount":
        const fixedDiscount = new FixedDiscount({
          voucherId: newVoucher._id,
          // conditions,
          conditions,
        });
        await fixedDiscount.save();
        break;

      case "PercentageDiscount":
        const percentageDiscount = new PercentageDiscount({
          voucherId: newVoucher._id,
          conditions, // conditions sẽ bao gồm minOrderValue, discountPercentage, maxDiscountAmount
        });
        await percentageDiscount.save();
        break;

      default:
        return res.status(400).json({ error: "Loại voucher không hợp lệ" });
    }

    res.status(201).json({ message: "Tạo voucher thành công", newVoucher });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi tạo voucher", details: error.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, promotionProgramId, type, isActive, conditions } = req.body;

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      {
        code,
        promotionProgram: promotionProgramId,
        type,
        isActive,
      },
      { new: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({ error: "Không tìm thấy voucher" });
    }

    // Xóa các điều kiện cũ trước khi thêm mới (để tránh dữ liệu không nhất quán)
    await BuyXGetY.deleteMany({ voucherId: updatedVoucher._id });
    await FixedDiscount.deleteMany({ voucherId: updatedVoucher._id });
    await PercentageDiscount.deleteMany({ voucherId: updatedVoucher._id });

    // Tạo hoặc cập nhật các điều kiện mới theo loại voucher
    switch (type) {
      case "BuyXGetY":
        const buyXGetY = new BuyXGetY({
          voucherId: updatedVoucher._id,
          conditions,
        });
        await buyXGetY.save();
        break;

      case "FixedDiscount":
        const fixedDiscount = new FixedDiscount({
          voucherId: updatedVoucher._id,
          conditions,
        });
        await fixedDiscount.save();
        break;

      case "PercentageDiscount":
        const percentageDiscount = new PercentageDiscount({
          voucherId: updatedVoucher._id,
          conditions,
        });
        await percentageDiscount.save();
        break;

      default:
        return res.status(400).json({ error: "Loại voucher không hợp lệ" });
    }

    res
      .status(200)
      .json({ message: "Cập nhật voucher thành công", updatedVoucher });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi cập nhật voucher", details: error.message });
  }
};

// API: Xóa voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVoucher = await Voucher.findById(id);

    if (!deletedVoucher) {
      return res.status(404).json({ error: "Không tìm thấy voucher" });
    }
    deletedVoucher.isDeleted = true;
    await deletedVoucher.save();


    res.status(200).json({ message: "Xóa voucher thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi xóa voucher", details: error.message });
  }
};

// API: Thay đổi trạng thái của voucher (isActive)
exports.changeVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({ error: "Không tìm thấy voucher" });
    }

    res.status(200).json({
      message: "Thay đổi trạng thái voucher thành công",
      updatedVoucher,
    });
  } catch (error) {
    res.status(500).json({
      error: "Lỗi khi thay đổi trạng thái voucher",
      details: error.message,
    });
  }
};


//  Lấy tất cả voucher đang hoạt động
exports.getAllActiveVouchers = async (req, res) => {
  try {
    const currentDate = new Date();

    // Lấy các chương trình khuyến mãi đang hoạt động với ObjectId hợp lệ
    const activePromotions = await PromotionProgram.find({
      isActive: true, 
      isDeleted: false,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

  
    const activePromotionIds = activePromotions.map((promo) => promo._id);
   

    // Kiểm tra nếu không có chương trình khuyến mãi hợp lệ
    if (activePromotionIds.length === 0) {
      return res.status(200).json({
        message: "Không có voucher nào hiện đang hoạt động.",
        vouchers: [],
      });
    }

    // Lấy tất cả voucher thuộc các chương trình khuyến mãi hợp lệ
    const vouchers = await Voucher.find({
      promotionProgram: { $in: activePromotionIds },
      isActive: true,
    });

    // console.log("Vouchers found:", vouchers);
    const voucherDetails = await Promise.all(
      vouchers.map(async (voucher) => {
        let conditions = null;

        switch (voucher.type) {
          case "BuyXGetY":
            conditions = await BuyXGetY.findOne({ voucherId: voucher._id });
            break;
          case "FixedDiscount":
            conditions = await FixedDiscount.findOne({
              voucherId: voucher._id,
            });
            break;
          case "PercentageDiscount":
            conditions = await PercentageDiscount.findOne({
              voucherId: voucher._id,
            });
            break;
          default:
            conditions = null;
        }

        return {
          ...voucher._doc,
          conditions: conditions ? conditions.conditions : null,
        };
      })
    );

    res.status(200).json(voucherDetails);
  } catch (error) {
    res.status(500).json({
      error: "Lỗi khi lấy danh sách voucher",
      details: error.message,
    });
  }
};
