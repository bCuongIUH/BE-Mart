
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


exports.addWarehouseEntry = async (req, res) => {
    try {
        const { entryCode, enteredBy, lines } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!entryCode || !enteredBy || !lines || !Array.isArray(lines) || lines.length === 0) {
            return res.status(400).json({ message: 'Dữ liệu đầu vào không hợp lệ' });
        }
        const user = await User.findById(enteredBy);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tìm thấy' });
        }
        const warehouseEntry = new WarehouseEntry({
            entryCode,
            enteredBy,
            lines
        });

        // Lưu vào cơ sở dữ liệu
        await warehouseEntry.save();

        // Lấy tất cả sản phẩm liên quan trong một lần
        const productIds = lines.map(line => line.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        
        const missingProducts = productIds.filter(productId => 
            !products.some(product => product._id.toString() === productId)
        );
        if (missingProducts.length > 0) {
            return res.status(404).json({ message: 'Một hoặc nhiều sản phẩm không tìm thấy', missingProducts });
        }
        for (const line of lines) {
            const { productId, supplierId, quantity } = line;

            const product = products.find(p => p._id.toString() === productId);
            const existingLineIndex = product.lines.findIndex(l => l.supplierId.toString() === supplierId);
            if (existingLineIndex > -1) {
    
                product.lines[existingLineIndex].quantity = quantity; 
            } else {

                product.lines.push({ supplierId, quantity });
            }

            product.quantity += quantity; 

            await product.save();
        }

        res.status(200).json({ message: 'Nhập hàng thành công', warehouseEntry });
    } catch (error) {
        console.error('Lỗi khi nhập hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
