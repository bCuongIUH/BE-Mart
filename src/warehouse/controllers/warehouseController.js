const mongoose = require('mongoose');
const Product = require('../../products/models/product');
const Warehouse = require('../models/warehouse');
const User = require('../../user/models/User');
const Supplier = require('../../supplier/models/supplier');
const WarehouseEntry = require('../models/warehouse');
const Stock = require('../models/Stock');
// Lấy tất cả sp trong kho

exports.getAllWarehouse = async (req, res) => {
    try {
      const warehouse = await Warehouse.find();
      res.status(200).json(warehouse);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error });
    }
  };


//lấy sản phẩm theo nhà cung câp
  exports.getProductsBySupplierId = async (req, res) => {
    try {
        const { supplierId } = req.params;

        // Kiểm tra xem nhà cung cấp có tồn tại không
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(400).json({ message: 'Nhà cung cấp không hợp lệ' });
        }

        // Lấy danh sách sản phẩm thuộc nhà cung cấp
        const products = await Product.find({ supplier: supplierId });

        res.status(200).json({ products });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// tạo phiếu nhập kho   
exports.createWarehouseEntry = async (req, res) => {
    try {
        const { entryCode, supplierId, products, enteredBy } = req.body;

        // Validate enteredBy (ID người nhập)
        if (!enteredBy || enteredBy.length !== 24) {
            return res.status(400).json({ message: 'ID người nhập không hợp lệ' });
        }

        // Kiểm tra sự tồn tại của nhà cung cấp
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(400).json({ message: 'Nhà cung cấp không hợp lệ' });
        }

        // Kiểm tra mã nhập kho có trùng không
        const existingEntry = await WarehouseEntry.findOne({ entryCode });
        if (existingEntry) {
            return res.status(400).json({ message: 'Mã nhập kho đã tồn tại. Vui lòng sử dụng mã khác.' });
        }

        // Kiểm tra tính hợp lệ của các sản phẩm trước khi tạo bản ghi nhập kho
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({ message: `Không tìm thấy sản phẩm với ID ${item.productId}.` });
            }

            // Chuyển đổi quantity về số để tránh lỗi
            const itemQuantity = Number(item.quantity);
            if (isNaN(itemQuantity) || itemQuantity <= 0) {
                return res.status(400).json({ message: 'Số lượng sản phẩm không hợp lệ.' });
            }

            // Tìm đơn vị chuyển đổi trong sản phẩm (baseUnit hoặc conversionUnits)
            const unit = product.baseUnit.name === item.unit
                ? product.baseUnit
                : product.conversionUnits.find(u => u.name === item.unit);

            if (!unit) {
                // Nếu không tìm thấy đơn vị tương ứng, báo lỗi
                return res.status(400).json({ message: `Đơn vị ${item.unit} không hợp lệ cho sản phẩm ${product.name}.` });
            }
        }

        // Tạo mới bản ghi nhập kho
        const newWarehouseEntryRecord = new WarehouseEntry({
            entryCode,
            enteredBy,
            supplier: supplierId,
            products, // Lưu danh sách sản phẩm nhập với đơn vị và số lượng
        });

        // Lưu bản ghi nhập kho mới
        await newWarehouseEntryRecord.save();

        // Nếu lưu bản ghi nhập kho thành công, cập nhật số lượng sản phẩm trong kho
        for (const item of products) {
            const product = await Product.findById(item.productId);
            const itemQuantity = Number(item.quantity);

            // Cập nhật số lượng sản phẩm trong kho
            const existingStock = await Stock.findOne({ productId: product._id, unit: item.unit });
            if (existingStock) {
                existingStock.quantity += itemQuantity; 
                existingStock.lastUpdated = Date.now(); // Cập nhật thời gian
                await existingStock.save(); // Lưu lại thay đổi
            } else {
                // Nếu chưa có bản ghi, tạo mới
                const newStock = new Stock({
                    productId: product._id,
                    quantity: itemQuantity,
                    unit: item.unit
                });
                await newStock.save(); // Lưu bản ghi mới
            }
        }

        res.status(201).json({ message: 'Nhập kho thành công', warehouseEntry: newWarehouseEntryRecord });
    } catch (error) {
        console.error('Lỗi khi nhập kho:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
