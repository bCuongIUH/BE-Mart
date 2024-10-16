const mongoose = require('mongoose');
const Product = require('../../products/models/product');
const Warehouse = require('../models/warehouse');
const Category = require('../../products/models/category')
const s3 = require('../../config/configS3'); 
const uuid = require('uuid');
const uploadImageToCloudinary = require('../../upload/uploadImage');
const User = require('../../user/models/User');
const Supplier = require('../../supplier/models/supplier');
const WarehouseEntry = require('../models/warehouse');
// Lấy tất cả sp trong kho
exports.getAllWarehouse = async (req, res) => {
    try {
      const warehouse = await Warehouse.find();
      res.status(200).json(warehouse);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error });
    }
  };


// Tạo phiếu nhập hàng
exports.createWarehouseEntry = async (req, res) => {
    const { supplierId, enteredBy, entryCode } = req.body; 

    try {
        // Kiểm tra thông tin nhà cung cấp
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(404).json({ message: 'Nhà cung cấp không tồn tại' });
        }

    
        const user = await User.findById(enteredBy);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (!entryCode) {
            return res.status(400).json({ message: 'Mã phiếu nhập hàng không được để trống.' });
        }

        // Tạo phiếu nhập hàng (header)
        const newWarehouseEntry = new WarehouseEntry({
            entryCode,   
            enteredBy,
            supplierId,
            lines: []
        });

        // Lưu phiếu nhập hàng vào cơ sở dữ liệu
        await newWarehouseEntry.save();

        return res.status(201).json({ message: 'Phiếu nhập hàng đã được tạo!', warehouseEntry: newWarehouseEntry });
    } catch (error) {
        console.error('Lỗi khi tạo phiếu nhập hàng:', error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
//nhaphang
exports.nhapHang = async (req, res) => {
    const { entryId, products } = req.body;
    try {
        const warehouseEntry = await WarehouseEntry.findById(entryId);
        if (!warehouseEntry) {
            return res.status(404).json({ message: 'Phiếu nhập hàng không tồn tại' });
        }
        if (warehouseEntry.isFinalized) {
            return res.status(400).json({ message: 'Phiếu nhập hàng này đã được hoàn tất và không thể cập nhật.' });
        }

        // Đặt biến để tính tổng tiền hàng
        let totalAmount = 0;
        // Duyệt qua từng sản phẩm trong danh sách
        for (const product of products) {
            const { productId, quantity, price } = product; 

            // Kiểm tra ID sản phẩm
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
            }

           
            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
            }

            
            const totalPrice = quantity * price;

           //line của phiếu
            warehouseEntry.lines.push({
                productId,
                quantity,
                price,
                totalPrice,
                isAvailable: quantity > 0
            });

            // Cập nhật số lượng sản phẩm
            existingProduct.quantity += quantity; 
            await existingProduct.save();

            // Cộng dồn tổng tiền hàng
            totalAmount += totalPrice;
        }
        warehouseEntry.totalAmount += totalAmount;

        warehouseEntry.isFinalized = true;

        await warehouseEntry.save();

        return res.status(200).json({ message: 'Nhập hàng thành công!', warehouseEntry });
    } catch (error) {
        console.error('Lỗi khi nhập hàng:', error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
