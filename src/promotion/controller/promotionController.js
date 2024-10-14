const Promotion = require('../models/promotionModel');

// Lấy danh sách tất cả các chương trình khuyến mãi
exports.getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find();
        res.status(200).json(promotions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách khuyến mãi', error });
    }
};

// Thêm chương trình khuyến mãi mới
exports.createPromotion = async (req, res) => {
  const { code, description, discountType } = req.body;

  try {
    // Tạo một chương trình khuyến mãi mới chỉ với phần header
    const newPromotion = new Promotion({
      code,
      description,
      discountType,
      //conditions: conditions || [] 
    });

    await newPromotion.save();
    res.status(201).json({ message: "Chương trình khuyến mãi được tạo thành công", promotion: newPromotion });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo chương trình khuyến mãi", error: error.message });
  }
};

// Cập nhật chi tiết chương trình khuyến mãi
exports.updatePromotion = async (req, res) => {
  const { id } = req.params;
  const conditions = req.body; 

  try {
    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }

    // Cập nhật phần conditions
    promotion.conditions = conditions; 
    await promotion.save();

    res.status(200).json({ message: "Điều kiện khuyến mãi đã được cập nhật thành công", promotion });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật điều kiện khuyến mãi", error: error.message });
  }
};

// Xóa chương trình khuyến mãi
exports.deletePromotion = async (req, res) => {
    const promotionId = req.params.id;

    try {
        const deletedPromotion = await Promotion.findByIdAndDelete(promotionId);

        if (!deletedPromotion) {
            return res.status(404).json({ message: 'Không tìm thấy chương trình khuyến mãi' });
        }

        res.status(200).json({ message: 'Xóa khuyến mãi thành công', deletedPromotion });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa khuyến mãi', error });
    }
};

