
const Product = require('../../products/models/product');
const Warehouse = require('../models/warehouse');
const s3 = require('../../config/configS3'); 
const uuid = require('uuid');
// Lấy tất cả sp trong kho
exports.getAllWarehouse = async (req, res) => {
    try {
      const warehouse = await Warehouse.find();
      res.status(200).json(warehouse);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error });
    }
  };
// Thêm phiếu nhập kho mới
exports.addWarehouseEntry = async (req, res) => {
    try {
        const { productName, quantity, purchasePrice, entryDate, supplier, sellingPrice, status, createdBy } = req.body; 
        const newEntry = new Warehouse({
            productName,
            quantity,
            purchasePrice,
            entryDate,
            supplier,
            sellingPrice,
            createdBy  
        });
        await newEntry.save();
        const populatedEntry = await Warehouse.findById(newEntry._id)
            .populate('supplier')
            .populate('createdBy');  

        res.status(201).json({ 
            message: 'Phiếu nhập kho đã được thêm thành công!', 
            entry: populatedEntry
        });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Lỗi khi thêm phiếu nhập kho', error });
    }
};
// Hàm upload ảnh lên S3
// const uploadImageToS3 = (image) => {
//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME, 
//         Key: `${uuid.v4()}-${image.originalname}`,
//         Body: image.buffer,
//         ContentType: image.mimetype,
//         ACL: 'public-read'
//     };

//     return s3.upload(params).promise();
// };
// // Hàm cập nhật phiếu nhập kho
// exports.updateWarehouseEntry = async (req, res) => {
//     try {
//         const { id } = req.params; 
//         const { sellingPrice, quantityToTake, description } = req.body; 

//         // Tìm phiếu nhập kho
//         const entry = await Warehouse.findById(id);
//         if (!entry) {
//             return res.status(404).json({ message: 'Phiếu nhập kho không tồn tại' });
//         }

//         // Cập nhật số lượng trong kho
//         if (quantityToTake && entry.quantity >= quantityToTake) {
//             entry.quantity -= quantityToTake;
//         } else if (quantityToTake && entry.quantity < quantityToTake) {
//             return res.status(400).json({ message: 'Số lượng yêu cầu lớn hơn số lượng trong kho' });
//         }

      
//         if (sellingPrice) entry.sellingPrice = sellingPrice;
//         if (description) entry.description = description;

//         if (req.file) {
            
//             const result = await uploadImageToS3(req.file);
//             entry.image = result.Location; 
//         }

//         await entry.save(); 

//         res.status(200).json({ message: 'Cập nhật thành công', entry });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi cập nhật phiếu nhập kho', error: error.message });
//     }
// };

// cap nhật kho để mang ra bán

exports.updateWarehouseEntry = async (req, res) => {
    try {
        const { sellingPrice, quantityToTake, description, image } = req.body;
        const entry = await Warehouse.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu nhập kho' });
        }

        // Kiểm tra số lượng có sẵn trong kho
        if (entry.quantity < quantityToTake) {
            return res.status(400).json({ message: 'Số lượng yêu cầu lớn hơn số lượng trong kho' });
        }

      
        entry.quantity -= quantityToTake;
        entry.status = 'in stock';

      
        const product = await Product.findOne({ name: entry.productName });

        if (product) {
            // Tìm dòng sản phẩm trong lines
            const existingLine = product.lines.find(line => line.supplierId.toString() === entry.supplier.toString());

            if (existingLine) {
               
                existingLine.unitPrice = sellingPrice; 
                existingLine.quantity += quantityToTake; 
                existingLine.totalPrice = existingLine.unitPrice * existingLine.quantity; 
            } else {
                // Tạo dòng sản phẩm mới nếu không tồn tại
                const lineProduct = {
                    supplierId: entry.supplier,
                    quantity: quantityToTake,
                    unitPrice: sellingPrice,
                    totalPrice: sellingPrice * quantityToTake,
                    isAvailable: true,
                };
                product.lines.push(lineProduct);
            }
            await product.save(); 
        } else {
            // Tạo sản phẩm mới nếu chưa tồn tại
            const lineProduct = {
                supplierId: entry.supplier,
                quantity: quantityToTake,
                unitPrice: sellingPrice,
                totalPrice: sellingPrice * quantityToTake,
                isAvailable: true,
            };

            const newProduct = new Product({
                name: entry.productName,
                description: description || 'Mô tả mặc định',
                image: image || 'URL hình ảnh mặc định',
                lines: [lineProduct]
            });
            await newProduct.save();
        }

        // Lưu thay đổi trong kho
        await entry.save();
        res.status(200).json({ message: 'Cập nhật phiếu nhập kho thành công', entry });
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật phiếu nhập kho', error: error.message });
    }
};


// Xóa sản phẩm trong kho
exports.deleteWarehouseEntry = async (req, res) => {
    try {
        const { id } = req.params; 
        if (!id) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
        }
        const deletedEntry = await Warehouse.findByIdAndDelete(id);
        if (!deletedEntry) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu nhập kho để xóa' });
        }

        res.status(200).json({ message: 'Phiếu nhập kho đã được xóa thành công!', entry: deletedEntry });
    } catch (error) {
        console.error('Lỗi khi xóa phiếu nhập kho:', error);
        res.status(500).json({ message: 'Lỗi khi xóa phiếu nhập kho', error });
    }
};