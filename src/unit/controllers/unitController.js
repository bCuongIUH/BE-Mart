const Unit = require('../models/Unit');
const UnitList = require('../models/UnitList');

// Tạo đơn vị tính mới
exports.createUnit = async (req, res) => {
    try {
        const { name, baseQuantity } = req.body;
        const unit = new Unit({ name, baseQuantity });
        await unit.save();
        return res.status(201).json({ message: 'Đơn vị tính đã được tạo', unit });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Tạo bảng đơn vị tính (header)
exports.createUnitList = async (req, res) => {
    try {
        const { name, createdBy, description, isActive } = req.body;
        const unitList = new UnitList({ name, createdBy, description, isActive });
        await unitList.save();
        return res.status(201).json({ message: 'Bảng đơn vị tính đã được tạo thành công', unitList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Thêm đơn vị tính vào bảng đơn vị tính
exports.addUnitToList = async (req, res) => {
    try {
        const { unitListId, name, baseQuantity, conversionRates } = req.body;
        const unit = new Unit({ name, baseQuantity, conversionRates });
        await unit.save();

        const unitList = await UnitList.findById(unitListId);
        if (!unitList) {
            return res.status(404).json({ message: 'Bảng đơn vị tính không tồn tại' });
        }

        unitList.units.push(unit._id);
        await unitList.save();
        return res.status(200).json({ message: 'Đơn vị tính đã được thêm vào bảng', unitList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Hàm quy đổi giữa các đơn vị
exports.convertUnit = async (req, res) => {
    try {
        const { fromUnitId, toUnitId, factor } = req.body;

        // Tìm đơn vị nguồn
        const fromUnit = await Unit.findById(fromUnitId);
        if (!fromUnit) {
            return res.status(404).json({ message: 'Đơn vị nguồn không tồn tại' });
        }

        // Kiểm tra nếu quy đổi đã tồn tại
        const existingRate = fromUnit.conversionRates.find(rate => rate.toUnit.toString() === toUnitId);
        if (existingRate) {
            return res.status(400).json({ message: 'Quy đổi đã tồn tại cho đơn vị này' });
        }

        // Thêm quy đổi vào đơn vị
        fromUnit.conversionRates.push({ toUnit: toUnitId, factor });
        await fromUnit.save();

        return res.status(200).json({ message: 'Quy đổi đã được thêm thành công', fromUnit });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};