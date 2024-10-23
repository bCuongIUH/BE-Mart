const UnitLine = require("../models/UnitLine");

// Lấy danh sách tất cả UnitLine
// exports.getAllUnitLines = async (req, res) => {
//     try {
//         const lines = await UnitLine.find().populate('header');
//         res.status(200).json(lines);
//     } catch (error) {
//         console.error('Lỗi khi lấy danh sách dòng đơn vị:', error);
//         res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
//     }
// };
exports.getAllUnitLines = async (req, res) => {
    try {
        const lines = await UnitLine.find()
            .populate('header') // Lấy thông tin từ UnitHeader
            .populate('details'); // Lấy thông tin từ UnitDetail

        res.status(200).json(lines);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách dòng đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Lấy thông tin một UnitLine theo ID
exports.getUnitLineById = async (req, res) => {
    try {
        const line = await UnitLine.findById(req.params.id).populate('header');
        if (!line) {
            return res.status(404).json({ message: 'Dòng đơn vị không tìm thấy' });
        }
        res.status(200).json(line);
    } catch (error) {
        console.error('Lỗi khi lấy dòng đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Lấy tất cả các dòng đơn vị theo ID tiêu đề
exports.getUnitLinesByHeaderId = async (req, res) => {
    try {
        const lines = await UnitLine.find({ header: req.params.headerId }).populate('header');
        res.status(200).json(lines);
    } catch (error) {
        console.error('Lỗi khi lấy các dòng đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
// Cập nhật thông tin một UnitLine
exports.updateUnitLine = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedLine = await UnitLine.findByIdAndUpdate(req.params.id, {
            name,
            description
        }, { new: true });

        if (!updatedLine) {
            return res.status(404).json({ message: 'Dòng đơn vị không tìm thấy' });
        }

        res.status(200).json({ message: 'Cập nhật dòng đơn vị thành công', line: updatedLine });
    } catch (error) {
        console.error('Lỗi khi cập nhật dòng đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Xóa một UnitLine
exports.deleteUnitLine = async (req, res) => {
    try {
        const deletedLine = await UnitLine.findByIdAndDelete(req.params.id);
        if (!deletedLine) {
            return res.status(404).json({ message: 'Dòng đơn vị không tìm thấy' });
        }
        res.status(200).json({ message: 'Xóa dòng đơn vị thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa dòng đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};