const Product = require("../../products/models/product");
const Stock = require("../models/Stock");

exports.getAllStocks = async (req, res) => {
    try {
        const products = await Product.find(); // Lấy toàn bộ sản phẩm
        const stocksInfo = {};

        for (const product of products) {
            const baseUnit = product.baseUnit;
            // Truy vấn số lượng tồn kho cho từng sản phẩm
            const stocks = await Stock.find({ productId: product._id });

            // Nếu sản phẩm chưa có trong stocksInfo, khởi tạo nó
            if (!stocksInfo[product._id]) {
                stocksInfo[product._id] = {
                    productName: product.name,
                    productCode: product.code, // Lưu mã sản phẩm
                    image: product.image, // Lưu hình ảnh sản phẩm
                    stocks: []
                };
            }

            // Kiểm tra xem có tồn kho không
            if (stocks.length === 0) {
                stocksInfo[product._id].stocks.push({
                    quantity: 0,
                    unit: baseUnit.name 
                });
                // Thêm các đơn vị quy đổi và đặt số lượng bằng 0
                product.conversionUnits.forEach(unit => {
                    stocksInfo[product._id].stocks.push({
                        quantity: 0,
                        unit: unit.name 
                    });
                });
            } else {
                // Nếu có tồn kho, thêm thông tin cho từng bản ghi tồn kho
                stocks.forEach(stock => {
                    stocksInfo[product._id].stocks.push({
                        quantity: stock.quantity,
                        unit: stock.unit,
                        lastUpdated: stock.lastUpdated
                    });
                });
            }
        }

        // Chuyển đổi đối tượng thành mảng
        const result = Object.keys(stocksInfo).map(key => ({
            productId: key,
            productName: stocksInfo[key].productName,
            productCode: stocksInfo[key].productCode, 
            image: stocksInfo[key].image, 
            stocks: stocksInfo[key].stocks
        }));

        // Trả về thông tin tồn kho và thông tin sản phẩm
        res.status(200).json({
            message: 'Lấy thông tin tồn kho thành công',
            stocks: result
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tồn kho:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

//
// exports.getAllStocks = async (req, res) => {
//     try {
//         const products = await Product.find();
//         const stocksInfo = [];

//         for (const product of products) {
//             const { _id, name, code, image, description, category, supplier, baseUnit, conversionUnits, barcode } = product;

//             // Find all stock entries for this product
//             const stocks = await Stock.find({ productId: _id });

//             // If no stocks exist, create entries with quantity 0 for both base and conversion units
//             if (stocks.length === 0) {
//                 // Add base unit as Đơn vị tính with quantity 0
//                 stocksInfo.push({
//                     productId: _id,
//                     productName: name,
//                     productCode: code,
//                     image,
//                     description,
//                     barcode: baseUnit.barcode,
//                     category,
//                     supplier,
//                     quantity: 0,
//                     unit: baseUnit.name,
//                     unitType: 'Đơn vị tính', // Base unit
//                     conversionValue: baseUnit.conversionValue
//                 });

//                 // Add conversion units with quantity 0
//                 conversionUnits.forEach(unit => {
//                     stocksInfo.push({
//                         productId: _id,
//                         productName: name,
//                         productCode: code,
//                         image,
//                         description,
//                         barcode: unit.barcode,
//                         category,
//                         supplier,
//                         quantity: 0,
//                         unit: unit.name,
//                         unitType: 'Đơn vị quy đổi', // Conversion unit
//                         conversionValue: unit.conversionValue
//                     });
//                 });
//             } else {
//                 // For each stock entry, create an entry based on whether it's a base or conversion unit
//                 stocks.forEach(stock => {
//                     // Determine if the stock unit is the base unit or a conversion unit
//                     let conversionValue;
//                     let unitBarcode;
//                     let unitType;

//                     if (stock.unit === baseUnit.name) {
//                         conversionValue = baseUnit.conversionValue;
//                         unitBarcode = baseUnit.barcode;
//                         unitType = 'Đơn vị tính'; // Base unit
//                     } else {
//                         const conversionUnit = conversionUnits.find(u => u.name === stock.unit);

//                         // If the unit is a conversion unit, get the base unit's details
//                         if (conversionUnit) {
//                             conversionValue = conversionUnit.conversionValue || 1;
//                             unitBarcode = conversionUnit.barcode || barcode;
//                             unitType = 'Đơn vị quy đổi'; // Conversion unit
//                         } else {
//                             // If the conversion unit is not found, fallback to base unit
//                             conversionValue = baseUnit.conversionValue; // Use base unit's conversion value
//                             unitBarcode = baseUnit.barcode;
//                             unitType = 'Đơn vị tính'; // Treat as base unit
//                         }
//                     }

//                     stocksInfo.push({
//                         productId: _id,
//                         productName: name,
//                         productCode: code,
//                         image,
//                         description,
//                         barcode: unitBarcode,
//                         category,
//                         supplier,
//                         quantity: stock.quantity,
//                         unit: stock.unit,
//                         unitType,
//                         conversionValue,
//                         lastUpdated: stock.lastUpdated
//                     });
//                 });
//             }
//         }

//         // Return the collected stock information
//         res.status(200).json({
//             message: 'Lấy thông tin tồn kho thành công',
//             stocks: stocksInfo
//         });
//     } catch (error) {
//         console.error('Lỗi khi lấy thông tin tồn kho:', error);
//         res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
//     }
// };
