const UnitDetail = require("../models/UnitDetail");

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

// Lấy thông tin tất cả chi tiết theo lineId
// exports.getDetailsByLineId = async (req, res) => {
//     try {
//         const details = await UnitDetail.find({ lineId: req.params.lineId }).populate('unitLine');
//         if (!details.length) {
//             return res.status(404).json({ message: 'Không tìm thấy chi tiết cho lineId này' });
//         }
//         res.status(200).json(details);
//     } catch (error) {
//         console.error('Lỗi khi lấy chi tiết theo lineId:', error);
//         res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
//     }
// };
exports.getDetailsByLineId = async (req, res) => {
    const { lineId } = req.params;

    try {
        const details = await UnitDetail.find({ lineId }); // Đảm bảo đây là đúng collection và trường
        if (!details.length) {
            return res.status(404).json({ message: 'Không tìm thấy chi tiết cho lineId này' });
        }
        res.status(200).json(details);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
//
exports.getDetailsByLineId = async (req, res) => {
    try {
        const { lineId } = req.params; // Lấy lineId từ params
        console.log('lineId:', lineId); // Ghi log lineId

        // Tìm các chi tiết theo unitLine (thay vì lineId)
        const details = await UnitDetail.find({ unitLine: lineId }); 

        console.log('details:', details); // Ghi log kết quả truy vấn

        if (details.length === 0) { // Kiểm tra độ dài mảng details
            return res.status(404).json({ message: 'Không tìm thấy chi tiết cho lineId này.' });
        }

        res.status(200).json(details); // Trả về chi tiết đơn vị
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn vị:', error);
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