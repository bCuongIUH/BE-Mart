
const Product = require('../../products/models/product');
const Warehouse = require('../models/warehouse');

// Thêm phiếu nhập kho mới
exports.addWarehouseEntry = async (req, res) => {
    try {
        const { productName, quantity, purchasePrice, entryDate, supplier, sellingPrice, status } = req.body;

        const newEntry = new Warehouse({
            productName,
            quantity,
            purchasePrice,
            entryDate,
            supplier,
            sellingPrice,
            status,
        });

        await newEntry.save();
        res.status(201).json({ message: 'Phiếu nhập kho đã được thêm thành công!', entry: newEntry });
    } catch (error) {
        console.error(error); // lỗii
        res.status(500).json({ message: 'Lỗi khi thêm phiếu nhập kho', error });
    }
};
// cập nhật giá sản phẩm và thông tin chi tiết ở kho để lấy sản phẩm từ kho ra bán
exports.updateWarehouseEntry = async (req, res) => {
    try {
        const { sellingPrice, status, quantityToTake, description, image } = req.body;
        const entry = await Warehouse.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu nhập kho' });
        }

        // Kiểm tra số lượng có sẵn trong kho
        if (entry.quantity < quantityToTake) {
            return res.status(400).json({ message: 'Số lượng yêu cầu lớn hơn số lượng trong kho' });
        }

        // Cập nhật giá bán và trạng thái trong kho
        entry.sellingPrice = sellingPrice || entry.sellingPrice; // Cập nhật giá bán nếu có
        entry.status = status || entry.status;

        // Giảm số lượng trong kho
        entry.quantity -= quantityToTake;

        // Nếu trạng thái là "on sale", thêm hoặc cập nhật vào collection Product
        if (entry.status === 'on sale') {
            const product = await Product.findOne({ name: entry.productName });

            // Dữ liệu dòng sản phẩm
            const lineProduct = {
                supplierId: entry.supplier,
                quantity: quantityToTake,
                unitPrice: entry.sellingPrice, // Sử dụng sellingPrice từ kho
                totalPrice: entry.sellingPrice * quantityToTake, // Tính tổng giá
                isAvailable: true,
            };

            if (product) {
                // Nếu sản phẩm đã tồn tại, cập nhật dòng sản phẩm
                product.lines.push(lineProduct);
                await product.save();
            } else {
                // Nếu sản phẩm chưa tồn tại, tạo sản phẩm mới
                const newProduct = new Product({
                    name: entry.productName,
                    description: description || 'Mô tả mặc định',
                    image: image || 'URL hình ảnh mặc định',
                    lines: [lineProduct] // Thêm dòng sản phẩm
                });

                await newProduct.save();
            }
        }

        // Lưu thay đổi trong kho
        await entry.save();
        res.status(200).json({ message: 'Cập nhật phiếu nhập kho thành công', entry });
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật phiếu nhập kho', error: error.message });
    }
};
