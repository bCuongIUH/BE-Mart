const Stock = require('../models/Stock');
const InvenStockment = require('../models/InvenStock');

exports.createInventoryAudit = async (req, res) => {
    try {
        const { code, description, auditDate, auditedBy, adjustments } = req.body;
console.log(req.body);
console.log("Received data:", JSON.stringify(req.body, null, 2));
        const existingAudit = await InvenStockment.findOne({ code });
        if (existingAudit) {
            return res.status(400).json({ message: 'Mã phiếu kiểm kê đã tồn tại. Vui lòng sử dụng mã khác.' });
        }

        const adjustmentLines = [];

        for (const adjustment of adjustments) {
            const { stockId, adjustmentQuantity: actualQuantity, reason } = adjustment;
            const stock = await Stock.findById(stockId);

            if (!stock) {
                return res.status(404).json({ message: `Không tìm thấy mặt hàng trong kho với ID ${stockId}` });
            }

            const initialQuantity = stock.quantity; // Số lượng ban đầu
            let adjustmentType;
            let quantityDifference;

            if (actualQuantity > initialQuantity) {
                adjustmentType = "increase";
                quantityDifference = actualQuantity - initialQuantity;
                stock.quantity += quantityDifference; // Cập nhật số lượng mới
            } else if (actualQuantity < initialQuantity) {
                adjustmentType = "decrease";
                quantityDifference = initialQuantity - actualQuantity;
                stock.quantity -= quantityDifference; // Cập nhật số lượng mới
            } else {
                continue; // Không có chênh lệch, bỏ qua điều chỉnh
            }

            const updatedQuantity = stock.quantity; // Số lượng sau khi cập nhật

            stock.lastUpdated = new Date();
            await stock.save();

            adjustmentLines.push({
                stockId,
                adjustmentType,
                initialQuantity,
                adjustmentQuantity: quantityDifference,
                updatedQuantity,
                reason
            });
        }

        const newInvenStockment = new InvenStockment({
            code,
            description,
            auditDate,
            auditedBy,
            lines: adjustmentLines
        });

        await newInvenStockment.save();

        res.status(201).json({ message: 'Tạo phiếu kiểm kê thành công và cập nhật kho', invenStockment: newInvenStockment });
    } catch (error) {
        console.error('Lỗi khi tạo phiếu kiểm kê:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
//

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