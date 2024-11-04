const PromotionProgram = require("../models/PromotionProgram");

// Thêm chương trình khuyến mãi mới
exports.createPromotionProgram = async (req, res) => {
  try {
    const { name, description, startDate, endDate, isActive } = req.body;

    const promotionProgram = new PromotionProgram({
      name,
      description,
      startDate,
      endDate,
      isActive : false,
    });

    await promotionProgram.save();
    res.status(201).json({
      message: "Chương trình khuyến mãi được tạo thành công",
      promotionProgram,
    });
  } catch (error) {
    res.status(500).json({
      error: "Có lỗi xảy ra khi tạo chương trình khuyến mãi",
      details: error.message,
    });
  }
};
//lấy chương trình đg hoạt động
exports.getActivePromotionPrograms = async (req, res) => {
  try {
    const today = new Date();
    
    // Lấy danh sách chương trình khuyến mãi đang hoạt động
    const activePromotions = await PromotionProgram.find({
      isDeleted: false,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    
    });

    res.status(200).json(activePromotions);
  } catch (error) {
    res.status(500).json({
      error: "Có lỗi xảy ra khi lấy danh sách chương trình khuyến mãi đang hoạt động",
      details: error.message,
    });
  }
};

// Sửa chương trình khuyến mãi
exports.updatePromotionProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, isActive } = req.body;

    const promotionProgram = await PromotionProgram.findByIdAndUpdate(
      id,
      {
        name,
        description,
        startDate,
        endDate,
        isActive,
      },
      { new: true }
    );

    if (!promotionProgram) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }

    res.status(200).json({
      message: "Chương trình khuyến mãi đã được cập nhật",
      promotionProgram,
    });
  } catch (error) {
    res.status(500).json({
      error: "Có lỗi xảy ra khi cập nhật chương trình khuyến mãi",
      details: error.message,
    });
  }
};

// Xóa chương trình khuyến mãi
exports.deletePromotionProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Cập nhật isDelete thành true thay vì xóa
    const promotionProgram = await PromotionProgram.findById(id);

    if (!promotionProgram) {
      return res.status(404).json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }
    promotionProgram.isDeleted = true;
    await promotionProgram.save();

    res.status(200).json({ message: "Chương trình khuyến mãi đã được đánh dấu là xóa" });
  } catch (error) {
    res.status(500).json({
      error: "Có lỗi xảy ra khi cập nhật trạng thái xóa cho chương trình khuyến mãi",
      details: error.message,
    });
  }
};

// Lấy tất cả các chương trình khuyến mãi
exports.getAllPromotionPrograms = async (req, res) => {
  const currentDate = new Date();
  try {
    const promotionPrograms = await PromotionProgram.find({ isDeleted: false });
    res.status(200).json(promotionPrograms);
  } catch (error) {
    res.status(500).json({
      error: "Có lỗi xảy ra khi lấy danh sách chương trình khuyến mãi",
      details: error.message,
    });
  }
};

// Thay đổi trạng thái chương trình khuyến mãi (isActive)
exports.changePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const promotionProgram = await PromotionProgram.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!promotionProgram) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }

    res.status(200).json({
      message: "Trạng thái chương trình khuyến mãi đã được thay đổi",
      promotionProgram,
    });
  } catch (error) {
    res.status(500).json({
      error: "Có lỗi xảy ra khi thay đổi trạng thái chương trình khuyến mãi",
      details: error.message,
    });
  }
};
