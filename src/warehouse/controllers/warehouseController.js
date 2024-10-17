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
// Tạo phiếu nhập hàng
// exports.createWarehouseEntry = async (req, res) => {
//     const { supplierId, enteredBy, entryCode,products } = req.body; 

//     try {
//         // Kiểm tra thông tin nhà cung cấp
//         const supplier = await Supplier.findById(supplierId);
//         if (!supplier) {
//             return res.status(404).json({ message: 'Nhà cung cấp không tồn tại' });
//         }

    
//         const user = await User.findById(enteredBy);
//         if (!user) {
//             return res.status(404).json({ message: 'Người dùng không tồn tại' });
//         }

//         if (!entryCode) {
//             return res.status(400).json({ message: 'Mã phiếu nhập hàng không được để trống.' });
//         }

//         // Tạo phiếu nhập hàng (header)
//         const newWarehouseEntry = new WarehouseEntry({
//             entryCode,   
//             enteredBy,
//             supplierId,
//             products
//         });

//         // Lưu phiếu nhập hàng vào cơ sở dữ liệu
//         await newWarehouseEntry.save();

//         return res.status(201).json({ message: 'Phiếu nhập hàng đã được tạo!', warehouseEntry: newWarehouseEntry });
//     } catch (error) {
//         console.error('Lỗi khi tạo phiếu nhập hàng:', error);
//         return res.status(500).json({ message: 'Lỗi server', error: error.message });
//     }
// };


// Nhập kho từ nhà cung cấp
exports.createWarehouseEntry = async (req, res) => {
    try {
        const { entryCode, supplierId, products, enteredBy } = req.body; 

        if (!enteredBy || enteredBy.length !== 24) {
            return res.status(400).json({ message: 'Nhà cung cấp không hợp lệ' });
        }
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(400).json({ message: 'Nhà cung cấp không hợp lệ' });
        }

        let totalAmount = 0;

        
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product || product.supplier.toString() !== supplierId) {
                return res.status(400).json({ message: `Sản phẩm với ID ${item.productId} không thuộc nhà cung cấp này.` });
            }
            
            // Tính tổng số tiền
            totalAmount += item.quantity * item.price;

          
            product.quantity += item.quantity;
          
            await product.save(); 
        }

        // Tạo phiếu nhập kho
        const newWarehouseEntry = new WarehouseEntry({
            entryCode,
            enteredBy,
            supplier: supplierId,
            totalAmount,
            products,
        });

        await newWarehouseEntry.save();

        res.status(201).json({ message: 'Nhập kho thành công', warehouseEntry: newWarehouseEntry });
    } catch (error) {
        console.error('Lỗi khi nhập kho:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
