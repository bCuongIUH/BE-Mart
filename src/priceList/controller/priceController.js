const PriceList = require('../model/priceList'); 
const Product = require('../../products/models/product'); 
const mongoose = require('mongoose'); 

// tạo bảng giá header
exports.createPriceList = async (req, res) => {
  try {
    const { code, name, startDate, endDate,  description } = req.body;


    console.log("nhập zoooo:", req.body);


    if (!code || !name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }


    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.' });
    }

    const existingPriceLists = await PriceList.find({
      $or: [
        { 
          startDate: { $lte: endDateObj, $gte: startDateObj } 
        }, 
        { 
          endDate: { $gte: startDateObj, $lte: endDateObj } 
        }
      ]
    });

    if (existingPriceLists.length > 0) {
      return res.status(400).json({ success: false, message: 'Đã có bảng giá tồn tại trong khoảng thời gian này.' });
    }

    
    const newPriceList = new PriceList({
      code,
      name,
      startDate: startDateObj, 
      endDate: endDateObj,      
      isActive : false,
      description
    });

    await newPriceList.save();

    res.status(201).json({ success: true, message: 'Bảng giá đã được tạo!', priceList: newPriceList });
  } catch (error) {
    console.error("Error creating price list:", error);
    res.status(500).json({ success: false, message: 'Không thể tạo bảng giá', error: error.message });
  }
};


//lấy ds bảng giá
  exports.getAllPriceLists = async (req, res) => {
    try {
      const priceLists = await PriceList.find();
  
      res.status(200).json({ success: true, priceLists });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách bảng giá', error: error.message });
    }
  };
  
  // Get a Price List by ID
  exports.getPriceListById = async (req, res) => {
    try {
      const priceList = await PriceList.findById(req.params.id);
  
      if (!priceList) {
        return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }
  
      res.status(200).json({ success: true, priceList });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi tìm bảng giá', error: error.message });
    }
  };
  
  // Update a Price List
  exports.updatePriceList = async (req, res) => {
    try {
      const { code, name, startDate, endDate, isActive } = req.body;
      
      // Find the price list by ID and update it
      const updatedPriceList = await PriceList.findByIdAndUpdate(
        req.params.id,
        { code, name, startDate, endDate, isActive },
        { new: true }
      );
  
      if (!updatedPriceList) {
        return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }
  
      res.status(200).json({ success: true, message: 'Bảng giá đã được cập nhật!', priceList: updatedPriceList });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi cập nhật bảng giá', error: error.message });
    }
  };
  
  // Delete a Price List
  exports.deletePriceList = async (req, res) => {
    try {
      const priceList = await PriceList.findByIdAndDelete(req.params.id);
  
      if (!priceList) {
        return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }
  
      res.status(200).json({ success: true, message: 'Bảng giá đã được xóa!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi xóa bảng giá', error: error.message });
    }
  };
  //thêm giá cho sp
  exports.addPricesToPriceList = async (req, res) => {
    const { products, priceListId } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(priceListId)) {
            return res.status(400).json({ success: false, message: 'ID bảng giá không hợp lệ.' });
        }

        const priceList = await PriceList.findById(priceListId);
        if (!priceList) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bảng giá' });
        }

        const currentDate = new Date();

        for (const product of products) {
            const productId = product.productId;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
            }

            const price = product.price;

            const existingProductIndex = priceList.products.findIndex(p => p.productId.toString() === productId);

            if (existingProductIndex !== -1) {
                // Nếu sản phẩm đã có, cập nhật giá
                priceList.products[existingProductIndex].price = price;
            } else {
                
                priceList.products.push({
                    productId: productId, 
                    price
                });
            }

            // Cập nhật thông tin giá cho sản phẩm trong Product model
            if (currentDate >= priceList.startDate) {
                await Product.findByIdAndUpdate(
                    productId,
                    {
                        currentPrice: price,
                        $addToSet: { priceLists: { priceListId: priceListId } }
                    },
                    { new: true }
                );
            } else {
                await Product.findByIdAndUpdate(
                    productId,
                    {
                        currentPrice: 0,
                        $addToSet: { priceLists: { priceListId: priceListId } }
                    },
                    { new: true }
                );
            }
        }

        await priceList.save();

        return res.status(200).json({ success: true, message: 'Giá đã được thêm/cập nhật thành công!', priceList });
    } catch (error) {
        console.error('Lỗi khi thêm/cập nhật giá:', error);
        return res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi thêm/cập nhật giá vào bảng giá.', error: error.message });
    }
};
