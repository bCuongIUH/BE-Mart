const PriceList = require('../model/priceList'); 
const Product = require('../../products/models/product'); 
const mongoose = require('mongoose'); 
const cron = require('node-cron');

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
  // Tạo bảng giá header
exports.createPriceList = async (req, res) => {
  try {
      const { code, name, startDate, endDate, description } = req.body;

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
              { startDate: { $lte: endDateObj, $gte: startDateObj } },
              { endDate: { $gte: startDateObj, $lte: endDateObj } }
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
          description
      });

      await newPriceList.save();
      res.status(201).json({ success: true, message: 'Bảng giá đã được tạo!', priceList: newPriceList });
  } catch (error) {
      console.error("Error creating price list:", error);
      res.status(500).json({ success: false, message: 'Không thể tạo bảng giá', error: error.message });
  }
};

// Cập nhật giá vào bảng giá

exports.addPricesToPriceList = async (req, res) => {
  const { products, priceListId } = req.body;

  try {
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách sản phẩm không hợp lệ.' });
    }
    if (!mongoose.Types.ObjectId.isValid(priceListId)) {
      return res.status(400).json({ success: false, message: 'ID bảng giá không hợp lệ.' });
    }

    const priceList = await PriceList.findById(priceListId);
    if (!priceList) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bảng giá' });
    }

    if (priceList.isActive) {
      return res.status(400).json({ success: false, message: 'Không thể cập nhật giá khi bảng giá đang hoạt động.' });
    }

    const currentDate = new Date();

    for (const product of products) {
      const productId = product.productId;

    
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
      }

      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
      }

      const price = product.price;

      const existingProductIndex = priceList.products.findIndex(p => p.productId.toString() === productId);

   
      if (existingProductIndex !== -1) {
        priceList.products[existingProductIndex].price = price;
      } else {
        
        priceList.products.push({ productId: productId, price });
      }

      // Cập nhật giá cho sản phẩm nếu bảng giá đang hoạt động trong khoảng thời gian hiệu lực
      if (priceList.isActive && currentDate >= priceList.startDate && currentDate <= priceList.endDate) {
        await Product.findByIdAndUpdate(
          productId,
          { currentPrice: price, isAvailable: true },
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


// Ngưng hoạt động bảng giá
exports.deactivatePriceList = async (req, res) => {
  try {
      const { priceListId } = req.body;

      const priceList = await PriceList.findById(priceListId);
      if (!priceList) {
          return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }

      // Ngưng hoạt động bảng giá
      priceList.isActive = false;
      await priceList.save();

      // Đặt giá sản phẩm thành 0
      for (const product of priceList.products) {
          await Product.findByIdAndUpdate(product.productId, { currentPrice: 0, isAvailable: false });
      }

      res.status(200).json({ success: true, message: 'Bảng giá đã được ngừng hoạt động!', priceList });
  } catch (error) {
      console.error('Lỗi khi ngừng hoạt động bảng giá:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi ngừng hoạt động bảng giá.', error: error.message });
  }
};

// Kích hoạt bảng giá
exports.activatePriceList = async (req, res) => {
  const { priceListId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(priceListId)) {
      return res.status(400).json({ success: false, message: 'ID bảng giá không hợp lệ!' });
    }

    const priceList = await PriceList.findById(priceListId);
    if (!priceList) {
      return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
    }

    const currentDate = new Date(); 

    // Kiểm tra xem bảng giá có thể kích hoạt không
    if (currentDate < priceList.startDate || currentDate > priceList.endDate) {
      return res.status(400).json({ success: false, message: 'Không thể kích hoạt bảng giá vì ngày hiện tại không nằm trong khoảng thời gian hiệu lực!' });
    }

   
    priceList.isActive = true;
    await priceList.save();

    // Cập nhật giá cho sản phẩm
    if (priceList.products.length > 0) {
      const productsToUpdate = priceList.products.map(product => ({
        productId: product.productId,
        price: product.price
      }));

      // Cập nhật giá cho sản phẩm nếu bảng giá đang hoạt động trong khoảng thời gian hiệu lực
      for (const product of productsToUpdate) {
        await Product.findByIdAndUpdate(
          product.productId,
          { currentPrice: product.price, isAvailable: true },
          { new: true }
        );
      }
    }

    res.status(200).json({ success: true, message: 'Bảng giá đã được kích hoạt!', priceList });
  } catch (error) {
    console.error('Lỗi khi kích hoạt bảng giá:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi kích hoạt bảng giá.', error: error.message });
  }
};


// Hàm cập nhật giá sản phẩm
const updateProductPrices = async (products) => {
    const currentDate = new Date();

    for (const product of products) {
        const productId = product.productId;
        const price = product.price;

        await Product.findByIdAndUpdate(
            productId,
            { currentPrice: price, isAvailable: true },
            { new: true }
        );
    }
};


// Cập nhật giá theo cron job
// exports.updatePricesCronJob = async () => {
//   try {
//       const currentDate = new Date();
//       const expiredPriceLists = await PriceList.find({
//           isActive: true,
//           endDate: { $lt: currentDate }
//       });

//       for (const priceList of expiredPriceLists) {
//           for (const priceEntry of priceList.products) {
//               const productId = priceEntry.productId;
//               await Product.findByIdAndUpdate(
//                   productId,
//                   { currentPrice: 0, isAvailable: false },
//                   { new: true }
//               );
//           }
//           priceList.isActive = false;
//           await priceList.save();
//       }

//       console.log('Đã cập nhật giá cho các sản phẩm từ bảng giá hết hiệu lực.');
//   } catch (error) {
//       console.error('Lỗi khi cập nhật giá qua cron job:', error);
//   }
// };
exports.updateProductPricesByUnitDetails = async (req, res) => {
  const { priceListId, productId, units } = req.body;

  try {
      // Kiểm tra tính hợp lệ của ID bảng giá và sản phẩm
      if (!mongoose.Types.ObjectId.isValid(priceListId) || !mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ success: false, message: 'ID bảng giá hoặc sản phẩm không hợp lệ.' });
      }

      // Tìm bảng giá
      const priceList = await PriceList.findById(priceListId);
      if (!priceList || !priceList.isActive) {
          return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại hoặc không hoạt động.' });
      }

      // Tìm sản phẩm
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
      }

      // Cập nhật giá cho từng chi tiết đơn vị
      for (const unit of units) {
          const { unitId, price } = unit;

          // Tìm kiếm và cập nhật giá cho chi tiết đơn vị
          const unitIndex = product.units.findIndex(u => u.details.some(detail => detail.unitId.toString() === unitId));
          if (unitIndex !== -1) {
              const detailIndex = product.units[unitIndex].details.findIndex(detail => detail.unitId.toString() === unitId);
              if (detailIndex !== -1) {
                  product.units[unitIndex].details[detailIndex].price = price; // Cập nhật giá
              } else {
                  return res.status(404).json({ success: false, message: `Không tìm thấy chi tiết đơn vị với ID ${unitId}.` });
              }
          } else {
              return res.status(404).json({ success: false, message: `Không tìm thấy đơn vị với ID ${unitId}.` });
          }
      }

      // Lưu lại sản phẩm
      await product.save();

      return res.status(200).json({ success: true, message: 'Giá sản phẩm đã được thêm/cập nhật thành công!', product });
  } catch (error) {
      console.error('Lỗi khi thêm/cập nhật giá vào sản phẩm:', error);
      return res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi thêm/cập nhật giá vào sản phẩm.', error: error.message });
  }
};