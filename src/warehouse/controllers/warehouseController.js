
const Product = require('../../products/models/product');
const Warehouse = require('../models/warehouse');
const Category = require('../../products/models/category')
const s3 = require('../../config/configS3'); 
const uuid = require('uuid');
const uploadImageToCloudinary = require('../../upload/uploadImage');
// Lấy tất cả sp trong kho
exports.getAllWarehouse = async (req, res) => {
    try {
      const warehouse = await Warehouse.find();
      res.status(200).json(warehouse);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error });
    }
  };

  const generateUniqueWarehouseCode = async () => {
    let code;
    let isUnique = false;

    while (!isUnique) {
        const randomNumber = Math.floor(Math.random() * 10000); 
        code = `WH${randomNumber}`;

      //kiểm tra tồn tại
        const existingWarehouse = await Warehouse.findOne({ warehouseCode: code });
        if (!existingWarehouse) {
            isUnique = true; 
        }
    }

    return code; 
};
// Thêm phiếu nhập kho mới
exports.addWarehouseEntry = async (req, res) => {
    try {
        const { productName, quantity, purchasePrice, entryDate, supplier, sellingPrice, status, createdBy } = req.body; 
        const uniqueCode = await generateUniqueWarehouseCode();
        const newEntry = new Warehouse({
            warehouseCode : uniqueCode,
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
//update sp từ kho ra bán === lấy sp từ kho ra quầy
// exports.updateWarehouseEntry = async (req, res) => {
//     try {
//         const { sellingPrice, quantityToTake, description, image, categoryId, createdByOut } = req.body; 
//         const entry = await Warehouse.findById(req.params.id);

//         if (!entry) {
//             return res.status(404).json({ message: 'Không tìm thấy phiếu nhập kho' });
//         }
//         if (entry.quantity < quantityToTake) {
//             return res.status(400).json({ message: 'Số lượng yêu cầu lớn hơn số lượng trong kho' });
//         }

//         entry.quantity -= quantityToTake;
//         entry.status = 'in stock';

       
//         entry.createdByOut = createdByOut; 

//         const category = await Category.findById(categoryId); 
//         if (!category) {
//             return res.status(400).json({ message: 'Category không hợp lệ' });
//         }

//         const product = await Product.findOne({ name: entry.productName });

//         if (product) {
//             const existingLine = product.lines.find(line => line.supplierId.toString() === entry.supplier.toString());

//             if (existingLine) {
//                 existingLine.unitPrice = sellingPrice; 
//                 existingLine.quantity += quantityToTake; 
//                 existingLine.totalPrice = existingLine.unitPrice * existingLine.quantity;
//             } else {
//                 const lineProduct = {
//                     supplierId: entry.supplier,
//                     quantity: quantityToTake,
//                     unitPrice: sellingPrice,
//                     totalPrice: sellingPrice * quantityToTake,
//                     isAvailable: true,
//                 };
//                 product.lines.push(lineProduct); 
//             }

//             product.category = categoryId; 

//             await product.save(); 
//         } else {
//             const lineProduct = {
//                 supplierId: entry.supplier,
//                 quantity: quantityToTake,
//                 unitPrice: sellingPrice,
//                 totalPrice: sellingPrice * quantityToTake,
//                 isAvailable: true,
//             };

//             const newProduct = new Product({
//                 name: entry.productName,
//                 description: description || 'Mô tả mặc định',
//                 image: image || 'URL hình ảnh mặc định',
//                 lines: [lineProduct],
//                 category: categoryId, 
//             });
//             await newProduct.save(); 
//         }

//         await entry.save(); 
//         res.status(200).json({ message: 'Cập nhật phiếu nhập kho thành công', entry });
//     } catch (error) {
//         console.error("Error details:", error);
//         res.status(500).json({ message: 'Lỗi khi cập nhật phiếu nhập kho', error: error.message });
//     }
// };

exports.updateWarehouseEntry = async (req, res) => {
    try {
        const { sellingPrice, quantityToTake, description, categoryId, createdByOut } = req.body;
        const entry = await Warehouse.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu nhập kho' });
        }
        if (entry.quantity < quantityToTake) {
            return res.status(400).json({ message: 'Số lượng yêu cầu lớn hơn số lượng trong kho' });
        }

        
        let imageUrl = entry.image; 

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path, 'warehouse_images'); 
        }

        entry.quantity -= quantityToTake;
        entry.status = 'in stock';
        entry.createdByOut = createdByOut;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({ message: 'Category không hợp lệ' });
        }

        const product = await Product.findOne({ name: entry.productName });

        if (product) {
            const existingLine = product.lines.find(line => line.supplierId.toString() === entry.supplier.toString());

            if (existingLine) {
                existingLine.unitPrice = sellingPrice;
                // existingLine.quantity += quantityToTake;
                existingLine.quantity += parseInt(quantityToTake, 10);

                existingLine.totalPrice = existingLine.unitPrice * existingLine.quantity;
            } else {
                const lineProduct = {
                    supplierId: entry.supplier,
                    quantity: quantityToTake,
                    unitPrice: sellingPrice,
                    totalPrice: sellingPrice * quantityToTake,
                    isAvailable: true,
                };
                product.lines.push(lineProduct);
            }

            product.category = categoryId;
            await product.save();
        } else {
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
                image: imageUrl, 
                lines: [lineProduct],
                category: categoryId,
            });
            await newProduct.save();
        }
// console.log(imageUrl);

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