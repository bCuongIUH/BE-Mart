const Product = require('../../products/models/product');
const Unit = require('../models/Unit');
const UnitList = require('../models/UnitList');
// Lấy danh sách bảng đơn vị tính
exports.getAllUnitLists = async (req, res) => {
    try {
        const unitLists = await UnitList.find();
        return res.status(200).json({
            message: 'Lấy danh sách bảng đơn vị tính thành công',
            unitLists
        });
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


// Thêm đơn vị tính vào bảng đơn vị tính
exports.addUnitToList = async (req, res) => {
    try {
        const { unitListId, name, baseQuantity, conversionRates } = req.body;
        const unit = new Unit({ name, baseQuantity, conversionRates });
        await unit.save();
        // baseQuantity : mô tả 
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
        const { fromUnitId, toUnitId, quantity } = req.body;

        // Tìm đơn vị nguồn
        const fromUnit = await Unit.findById(fromUnitId);
        if (!fromUnit) {
            return res.status(404).json({ message: 'Đơn vị nguồn không tồn tại' });
        }

        // Tìm đơn vị đích
        const toUnit = await Unit.findById(toUnitId);
        if (!toUnit) {
            return res.status(404).json({ message: 'Đơn vị đích không tồn tại' });
        }

        // Kiểm tra quy đổi từ đơn vị nguồn sang đơn vị đích
        const conversionRate = fromUnit.conversionRates.find(rate => rate.toUnit.toString() === toUnitId);
        if (!conversionRate) {
            return res.status(404).json({ message: 'Không tìm thấy quy đổi từ đơn vị này' });
        }

        // Tính toán số lượng sau quy đổi
        const convertedQuantity = quantity * conversionRate.factor;

        return res.status(200).json({
            message: 'Quy đổi thành công',
            convertedQuantity,
            fromUnit: fromUnit.name,
            toUnit: toUnit.name,
            conversionFactor: conversionRate.factor,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};



// Hàm cập nhật quy đổi giữa các đơn vị
exports.updateConversionRate = async (req, res) => {
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
            // Nếu đã tồn tại, cập nhật giá trị
            existingRate.factor = factor;
        } else {
            // Nếu chưa tồn tại, thêm quy đổi mới
            fromUnit.conversionRates.push({ toUnit: toUnitId, factor });
        }

        // Lưu lại thay đổi
        await fromUnit.save();

        return res.status(200).json({
            message: 'Cập nhật quy đổi thành công',
            fromUnit
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// thêm đơn vị cơn bản vào sp và quy đổi 
exports.addUnitToProduct = async (req, res) => {
    try {
        const { productId, unitId } = req.body; // Lấy unitId từ body yêu cầu

        // Tìm sản phẩm theo ID và populate đơn vị
        const product = await Product.findById(productId).populate('units.unit');
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Tìm đơn vị cơ bản
        const baseUnit = await Unit.findById(unitId);
        if (!baseUnit) {
            return res.status(404).json({ message: 'Đơn vị cơ bản không tồn tại' });
        }

        // Kiểm tra nếu đơn vị cơ bản đã được thêm vào sản phẩm
        const baseUnitExists = product.units.some(unit => unit.unit._id.toString() === unitId);
        if (baseUnitExists) {
            return res.status(400).json({ message: 'Đơn vị cơ bản đã được thêm vào sản phẩm' });
        }

        // Thêm đơn vị cơ bản vào mảng đơn vị của sản phẩm
        product.units.push({ unit: baseUnit._id, conversionFactor: 1 });

        // Lấy tất cả các đơn vị quy đổi liên quan đến đơn vị cơ bản
        const conversionRates = baseUnit.conversionRates || [];

        // Thêm tất cả các đơn vị quy đổi vào sản phẩm
        conversionRates.forEach(rate => {
            const unitExists = product.units.some(unit => unit.unit._id.toString() === rate.toUnit.toString());
            if (!unitExists) {
                product.units.push({ unit: rate.toUnit, conversionFactor: rate.factor });
            }
        });

        // Lưu sản phẩm với tất cả các đơn vị
        await product.save();

        return res.status(200).json({ message: 'Đơn vị và các đơn vị quy đổi đã được thêm vào sản phẩm', product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};


// quy đổi ra số lượng theo đơn vị tính
exports.getConvertedQuantity = async (req, res) => {
    try {
        const { productId, unitId } = req.body; 

        // Tìm sản phẩm theo ID
        const product = await Product.findById(productId).populate('units.unit');
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Lấy đơn vị hiện tại và số lượng của sản phẩm
        const baseQuantity = product.quantity;

        // Tìm đơn vị được chọn từ mảng đơn vị của sản phẩm
        const selectedUnit = product.units.find(unit => unit.unit._id.toString() === unitId);
        if (!selectedUnit) {
            return res.status(404).json({ message: 'Đơn vị không tồn tại trong sản phẩm' });
        }

        // Tính toán số lượng sau quy đổi
        const convertedQuantity = baseQuantity / selectedUnit.conversionFactor;

        return res.status(200).json({
            message: 'Quy đổi thành công',
            product: {
                name: product.name,
                quantity: baseQuantity,
                convertedQuantity: convertedQuantity,
                baseUnit: product.units.find(unit => unit.conversionFactor === 1).unit.name, 
                selectedUnit: selectedUnit.unit.name,
                conversionFactor: selectedUnit.conversionFactor,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Lấy danh sách các đơn vị theo unitListId
exports.getUnitsByUnitListId = async (req, res) => {
    try {
        const { unitListId } = req.body; 

        // Tìm bảng đơn vị tính theo ID
        const unitList = await UnitList.findById(unitListId).populate('units'); 
        if (!unitList) {
            return res.status(404).json({ message: 'Bảng đơn vị tính không tồn tại' });
        }

        // Lấy danh sách đơn vị từ bảng đơn vị tính
        const units = unitList.units; // Giả sử 'units' chứa danh sách đơn vị tính

        return res.status(200).json({
            message: 'Lấy danh sách đơn vị thành công',
            units
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};


exports.addConversionUnitToList = async (req, res) => {
    try {
        const { unitListId, conversionUnitId, factor } = req.body;

        // Tìm bảng đơn vị tính
        const unitList = await UnitList.findById(unitListId);
        if (!unitList) {
            return res.status(404).json({ message: 'Bảng đơn vị không tồn tại' });
        }

        // Kiểm tra xem đơn vị quy đổi đã tồn tại chưa
        const existingConversionUnit = unitList.conversionUnits.find(
            (unit) => unit.conversionUnitId.toString() === conversionUnitId
        );

        if (existingConversionUnit) {
            return res.status(400).json({ message: 'Đơn vị quy đổi đã tồn tại' });
        }

        // Thêm đơn vị quy đổi vào bảng
        unitList.conversionUnits.push({ conversionUnitId, factor });
        await unitList.save();

        return res.status(200).json({ message: 'Đơn vị quy đổi đã được thêm thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error });
    }
};
