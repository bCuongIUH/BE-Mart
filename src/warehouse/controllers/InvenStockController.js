const Stock = require('../models/Stock');
const InvenStockment = require('../models/InvenStock');
const Product = require('../../products/models/product');
const Transaction = require('../models/Transaction');


//
exports.createInventoryAudit = async (req, res) => {
    try {
        const { code, description, auditDate, auditedBy, adjustments } = req.body;

        const existingAudit = await InvenStockment.findOne({ code });
        if (existingAudit) {
            return res.status(400).json({ message: 'Mã phiếu kiểm kê đã tồn tại. Vui lòng sử dụng mã khác.' });
        }

        const adjustmentLines = [];

        for (const adjustment of adjustments) {
            const { adjustmentQuantity: actualQuantity, reason, productId, unit } = adjustment;

            // Tìm product để xác định baseUnit và conversionUnits
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: `Không tìm thấy sản phẩm với productId ${productId}` });
            }

            // Chuẩn hóa đơn vị
            const sanitizedUnit = unit.trim(); // Không chuyển thành chữ thường

            console.log(`Đang tìm productId: ${productId} với unit: ${sanitizedUnit}`);

            // Kiểm tra nếu unit khớp với baseUnit hoặc một trong các conversionUnits
            let isValidUnit = false;
            if (product.baseUnit && product.baseUnit.name.trim().toLowerCase() === sanitizedUnit) {
                isValidUnit = true;
            } else if (product.conversionUnits) {
                isValidUnit = product.conversionUnits.some(cu => cu.name.trim().toLowerCase() === sanitizedUnit);
            }

          
            // Tìm kiếm stockId dựa trên productId và unit
            const stock = await Stock.findOne({ productId, unit: sanitizedUnit });
            if (!stock) {
                return res.status(404).json({ message: `Không tìm thấy mặt hàng trong kho với productId ${productId} và đơn vị ${unit}` });
            }
            const stockId = stock._id;

            const initialQuantity = stock.quantity;
            let adjustmentType;
            let quantityDifference;

            if (actualQuantity > initialQuantity) {
                adjustmentType = "increase";
                quantityDifference = actualQuantity - initialQuantity;
                stock.quantity += quantityDifference;
            } else if (actualQuantity < initialQuantity) {
                adjustmentType = "decrease";
                quantityDifference = initialQuantity - actualQuantity;
                stock.quantity -= quantityDifference;
            } else {
                continue; // Không có chênh lệch, bỏ qua điều chỉnh
            }

            const updatedQuantity = stock.quantity;
            stock.lastUpdated = new Date();
            await stock.save();

            // Thêm điều chỉnh vào lines
            adjustmentLines.push({
                stockId,
                productId,
                unit,
                adjustmentType,
                initialQuantity,
                adjustmentQuantity: quantityDifference,
                updatedQuantity,
                reason
            });

            // Tạo bản ghi Transaction mới với adjustmentType và adjustmentQuantity
            const transaction = new Transaction({
                productId,
                transactionType: "kiemke",
                quantity: quantityDifference,
                unit: sanitizedUnit,
                date: new Date(),
                adjustmentType,
                adjustmentQuantity: quantityDifference,
                isdeleted: false
            });
            await transaction.save();
        }

        const newInvenStockment = new InvenStockment({
            code,
            description,
            auditDate,
            auditedBy,
            lines: adjustmentLines
        });

        await newInvenStockment.save();

        res.status(201).json({ 
            message: 'Tạo phiếu kiểm kê thành công và cập nhật kho', 
            invenStockment: newInvenStockment,
            adjustmentLines
        });
    } catch (error) {
        console.error('Lỗi khi tạo phiếu kiểm kê:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};




exports.getInventoryList = async (req, res) => {
    try {
    
        const invenStockList = await InvenStockment.find()
            .populate({
                path: 'lines.stockId', // Liên kết tới `Stock` trong `lines`
                populate: {
                    path: 'productId', // Từ `Stock` tiếp tục populate `productId` để lấy chi tiết sản phẩm
                    select: 'name code '
                },
                select: 'quantity unit'
            })
            .populate('auditedBy', 'fullName'); 

        res.status(200).json(invenStockList);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu kiểm kê:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};