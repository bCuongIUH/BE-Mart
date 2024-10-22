const UnitDetail = require("../models/UnitDetail");
const UnitLine = require("../models/UnitLine");

// Lấy danh sách tất cả UnitDetail
exports.getAllUnitDetails = async (req, res) => {
    try {
        const details = await UnitDetail.find().populate('unitLine');
        res.status(200).json(details);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách chi tiết đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Lấy thông tin một UnitDetail theo ID
exports.getUnitDetailById = async (req, res) => {
    try {
        const detail = await UnitDetail.findById(req.params.id).populate('unitLine');
        if (!detail) {
            return res.status(404).json({ message: 'Chi tiết đơn vị không tìm thấy' });
        }
        res.status(200).json(detail);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};


exports.getDetailsByLineId = async (req, res) => {
    const { lineId } = req.params;

    try {
        // Kiểm tra nếu unitLine tồn tại
        const unitLine = await UnitLine.findById(lineId);
        if (!unitLine) {
            return res.status(404).json({ message: 'Không tìm thấy unitLine với ID này' });
        }

        // Lấy chi tiết theo lineId
        const details = await UnitDetail.find({ unitLine: lineId });
        if (!details.length) {
            return res.status(404).json({ message: 'Không tìm thấy chi tiết cho unitLine này' });
        }
        res.status(200).json(details);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
// Cập nhật thông tin một UnitDetail
exports.updateUnitDetail = async (req, res) => {
    try {
        const { name, value } = req.body;
        const updatedDetail = await UnitDetail.findByIdAndUpdate(req.params.id, {
            name,
            value
        }, { new: true });

        if (!updatedDetail) {
            return res.status(404).json({ message: 'Chi tiết đơn vị không tìm thấy' });
        }

        res.status(200).json({ message: 'Cập nhật chi tiết đơn vị thành công', detail: updatedDetail });
    } catch (error) {
        console.error('Lỗi khi cập nhật chi tiết đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Xóa một UnitDetail
exports.deleteUnitDetail = async (req, res) => {
    try {
        const deletedDetail = await UnitDetail.findByIdAndDelete(req.params.id);
        if (!deletedDetail) {
            return res.status(404).json({ message: 'Chi tiết đơn vị không tìm thấy' });
        }
        res.status(200).json({ message: 'Xóa chi tiết đơn vị thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa chi tiết đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};