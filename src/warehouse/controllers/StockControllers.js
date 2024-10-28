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
