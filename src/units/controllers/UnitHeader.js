const UnitHeader = require("../models/UnitHeader");

// Lấy danh sách tất cả UnitHeader
exports.getAllUnitHeaders = async (req, res) => {
    try {
        const headers = await UnitHeader.find();
        res.status(200).json(headers);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhóm đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Lấy thông tin một UnitHeader theo ID
exports.getUnitHeaderById = async (req, res) => {
    try {
        const header = await UnitHeader.findById(req.params.id);
        if (!header) {
            return res.status(404).json({ message: 'Nhóm đơn vị không tìm thấy' });
        }
        res.status(200).json(header);
    } catch (error) {
        console.error('Lỗi khi lấy nhóm đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Cập nhật thông tin một UnitHeader
exports.updateUnitHeader = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const updatedHeader = await UnitHeader.findByIdAndUpdate(req.params.id, {
            name,
            description,
            status
        }, { new: true });

        if (!updatedHeader) {
            return res.status(404).json({ message: 'Nhóm đơn vị không tìm thấy' });
        }

        res.status(200).json({ message: 'Cập nhật nhóm đơn vị thành công', header: updatedHeader });
    } catch (error) {
        console.error('Lỗi khi cập nhật nhóm đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Xóa một UnitHeader
exports.deleteUnitHeader = async (req, res) => {
    try {
        const deletedHeader = await UnitHeader.findByIdAndDelete(req.params.id);
        if (!deletedHeader) {
            return res.status(404).json({ message: 'Nhóm đơn vị không tìm thấy' });
        }
        res.status(200).json({ message: 'Xóa nhóm đơn vị thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa nhóm đơn vị:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
