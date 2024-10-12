const Unit = require('../models/unit'); 
// Lấy tất cả đơn vị tính
exports.getUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        return res.status(200).json(units);
    } catch (error) {
        console.error('Lỗi khi lấy đơn vị tính:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm đơn vị tính mới
exports.addUnit = async (req, res) => {
    const { unitName, unitQuantity, description } = req.body; 

    try {
        const newUnit = new Unit({
            unitName,
            unitQuantity,
            description
        });

        await newUnit.save(); // Lưu đơn vị tính mới
        return res.status(201).json({ message: 'Thêm đơn vị tính thành công', unit: newUnit });
    } catch (error) {
        console.error('Lỗi khi thêm đơn vị tính:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật đơn vị tính theo ID
exports.updateUnit = async (req, res) => {
    const { id } = req.params; 
    const { unitName, unitQuantity, description } = req.body; 
    try {
        const updatedUnit = await Unit.findByIdAndUpdate(id, {
            unitName,
            unitQuantity,
            description
        }, { new: true }); 

        if (!updatedUnit) {
            return res.status(404).json({ message: 'Đơn vị tính không tồn tại' });
        }

        return res.status(200).json({ message: 'Cập nhật đơn vị tính thành công', unit: updatedUnit });
    } catch (error) {
        console.error('Lỗi khi cập nhật đơn vị tính:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa đơn vị tính theo ID
exports.deleteUnit = async (req, res) => {
    const { id } = req.params; 

    try {
        const deletedUnit = await Unit.findByIdAndDelete(id); 

        if (!deletedUnit) {
            return res.status(404).json({ message: 'Đơn vị tính không tồn tại' });
        }

        return res.status(200).json({ message: 'Xóa đơn vị tính thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa đơn vị tính:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
