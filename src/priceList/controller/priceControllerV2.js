const PriceListV2 = require('../model/price'); 
const Product = require('../../products/models/product'); 

// Tạo Header cho bảng giá (chỉ tạo header mà không thêm sản phẩm)
exports.createPriceListHeader = async (req, res) => {
    try {
        const { code, name, description, startDate, endDate } = req.body;

        // Kiểm tra nếu đã có bảng giá trong cùng khoảng thời gian
        const existingPriceList = await PriceListV2.findOne({
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (existingPriceList) {
            return res.status(400).json({ message: 'Bảng giá đã tồn tại trong khoảng thời gian này' });
        }

        // Tạo header của bảng giá mới
        const priceListV2 = new PriceListV2({
            code,
            name,
            description,
            startDate,
            endDate,
            isActive: false // Ban đầu, bảng giá chưa kích hoạt
        });

        await priceListV2.save(); // Sử dụng priceList thay vì PriceListV2
        return res.status(201).json({ message: 'Header bảng giá được tạo thành công', priceListV2 });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi tạo header bảng giá', error });
    }
};

exports.addProductsToPriceList = async (req, res) => {
    try {
        const { priceListId, products } = req.body;

        // Kiểm tra thông tin đầu vào
        if (!priceListId || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Thông tin bảng giá hoặc sản phẩm không hợp lệ.' });
        }

        // Tìm bảng giá theo ID
        const priceListV2 = await PriceListV2.findById(priceListId);
        if (!priceListV2) {
            return res.status(404).json({ message: 'Bảng giá không tồn tại' });
        }

        // Thêm sản phẩm và đơn vị tính cùng với giá cho từng sản phẩm
        for (const product of products) {
            const { productId, unitPrices } = product;

            // Kiểm tra xem sản phẩm có tồn tại không
            if (!productId || !Array.isArray(unitPrices) || unitPrices.length === 0) {
                return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ.' });
            }

            // Kiểm tra từng đơn vị tính
            for (const unitPrice of unitPrices) {
                if (!unitPrice.unitDetail || unitPrice.price === undefined) {
                    return res.status(400).json({ message: 'Đơn vị tính hoặc giá không hợp lệ.' });
                }
            }

            const existingProduct = priceListV2.products.find(p => p.productId.toString() === productId);

            if (existingProduct) {
                // Nếu sản phẩm đã tồn tại, cập nhật giá và đơn vị tính
                for (const unitPrice of unitPrices) {
                    const existingUnitPrice = existingProduct.unitPrices.find(up => up.unitDetail.toString() === unitPrice.unitDetail);

                    if (existingUnitPrice) {
                        // Cập nhật giá cho đơn vị tính đã tồn tại
                        existingUnitPrice.price = unitPrice.price;
                    } else {
                        // Thêm mới đơn vị tính nếu chưa tồn tại
                        existingProduct.unitPrices.push(unitPrice);
                    }
                }
            } else {
                // Nếu sản phẩm chưa tồn tại, thêm mới
                priceListV2.products.push({
                    productId,
                    unitPrices
                });
            }
        }

        // Lưu lại bảng giá sau khi cập nhật
        await priceListV2.save(); // Lưu instance của bảng giá, không phải model
        return res.status(200).json({ message: 'Sản phẩm và giá đã được thêm vào bảng giá', priceList: priceListV2 });
    } catch (error) {
        console.error('Lỗi:', error); // Ghi lại thông tin chi tiết của lỗi
        return res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào bảng giá', error: error.message || error });
    }
};


exports.getPriceListDetails = async (req, res) => {
    try {
        const { priceListId } = req.params;

        // Tìm bảng giá theo ID
        const priceList = await PriceListV2.findById(priceListId).populate('products.productId').populate('products.unitPrices.unitDetail');
        
        if (!priceList) {
            return res.status(404).json({ message: 'Bảng giá không tồn tại' });
        }

        return res.status(200).json({ message: 'Lấy thông tin bảng giá thành công', priceList });
    } catch (error) {
        console.error('Lỗi:', error);
        return res.status(500).json({ message: 'Lỗi khi lấy thông tin bảng giá', error: error.message || error });
    }
};



exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('units.unitDetail'); // Đảm bảo các đơn vị tính được lấy
        return res.status(200).json(products);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        return res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error });
    }
};
