// const PriceList = require('../model/priceList'); 
const Product = require('../../products/models/product'); 
const mongoose = require('mongoose'); 
const PriceList = require('../model/priceModels'); 
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
  
  // Tạo bảng giá header
exports.createPriceList = async (req, res) => {
  try {
      const { code, name, startDate, endDate, description } = req.body;

      if (!code || !name || !startDate || !endDate) {
          return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
      }

     

      const newPriceList = new PriceList({
          code,
          name,
          startDate,
          endDate,
          description,
          isActive: false,
      });

      await newPriceList.save();
      res.status(201).json({ success: true, message: 'Bảng giá đã được tạo!', priceList: newPriceList });
  } catch (error) {
      console.error("Error creating price list:", error);
      res.status(500).json({ success: false, message: 'Không thể tạo bảng giá', error: error.message });
  }
};

// thêm giá vào sp theo đơn vị
exports.addPricesToPriceList = async (req, res) => {
  const { priceListId, products } = req.body;

  try {
      // Tìm bảng giá theo ID
      const priceList = await PriceList.findById(priceListId);
      
      if (!priceList) {
          return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }

      // Duyệt qua từng sản phẩm để thêm hoặc cập nhật giá
      for (const product of products) {
          const { productId, prices } = product; // Lấy ID sản phẩm và danh sách giá

          // Kiểm tra sản phẩm có tồn tại không
          const foundProduct = await Product.findById(productId).populate('baseUnit conversionUnits');
          if (!foundProduct) {
              return res.status(404).json({ success: false, message: `Sản phẩm với ID ${productId} không tồn tại!` });
          }

          // Lấy tên đơn vị gốc
          const baseUnitName = foundProduct.baseUnit.name;
          const availableUnits = foundProduct.conversionUnits.map(unit => unit.name);
          const allUnits = [baseUnitName, ...availableUnits];

          // Kiểm tra xem giá có hợp lệ với các đơn vị có sẵn không
          const invalidPrices = prices.filter(price => !allUnits.includes(price.unitName));
          if (invalidPrices.length > 0) {
              return res.status(400).json({ 
                  success: false, 
                  message: 'Có đơn vị không hợp lệ trong danh sách giá', 
                  invalidUnits: invalidPrices 
              });
          }

          // Kiểm tra xem sản phẩm đã có giá trong khoảng thời gian này chưa
          const existingPriceLists = await PriceList.find({
              'products.productId': productId,
              startDate: { $lte: priceList.endDate },
              endDate: { $gte: priceList.startDate },
          
          });

          if (existingPriceLists.length > 0) {
              return res.status(400).json({ 
                  success: false, 
                  message: `Sản phẩm ${productId} đã có giá trong khoảng thời gian này!`
              });
          }

          // Kiểm tra xem sản phẩm đã tồn tại trong bảng giá chưa
          const existingProductIndex = priceList.products.findIndex(p => p.productId.toString() === productId);

          if (existingProductIndex !== -1) {
              // Nếu sản phẩm đã tồn tại, cập nhật giá
              const existingProduct = priceList.products[existingProductIndex];

              prices.forEach(price => {
                  const priceIndex = existingProduct.prices.findIndex(p => p.unitName === price.unitName);
                  if (priceIndex !== -1) {
                      // Cập nhật giá nếu đơn vị đã có
                      existingProduct.prices[priceIndex].price = price.price;
                  } else {
                      // Thêm giá mới nếu đơn vị chưa có
                      existingProduct.prices.push(price);
                  }
              });
          } else {
              // Nếu sản phẩm chưa có, thêm mới
              priceList.products.push({
                  productId,
                  prices
              });
          }
      }

      await priceList.save();
      res.status(200).json({ success: true, message: 'Giá đã được thêm hoặc cập nhật vào bảng giá!', priceList });
  } catch (error) {
      console.error("Error adding prices to price list:", error);
      res.status(500).json({ success: false, message: 'Không thể thêm hoặc cập nhật giá vào bảng giá', error: error.message });
  }
};



// lấy giá sp theo bảng giá và đơn vị hoạt động
exports.getActiveProductPrices = async (req, res) => {
    try {
        const currentDate = new Date();
  
        // Tìm tất cả các bảng giá đang hoạt động trong khoảng thời gian hiện tại và có isActive = true
        const activePriceLists = await PriceList.find({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            isActive: true
        });
  
        if (activePriceLists.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bảng giá nào đang hoạt động.' });
        }
  
        // Lấy tất cả sản phẩm từ bảng Product
        const products = await Product.find().populate('baseUnit conversionUnits');
  
        // Tạo mảng chứa giá cho từng sản phẩm từ các bảng giá hoạt động
        const prices = [];
  
        // Duyệt qua từng bảng giá hoạt động để lấy giá của các sản phẩm trong bảng giá đó
        activePriceLists.forEach(priceList => {
            priceList.products.forEach(p => {
                const product = products.find(prod => prod._id.toString() === p.productId.toString());
  
                if (product) {
                    prices.push({
                        productId: p.productId,
                        productName: product.name,
                        prices: p.prices
                    });
                }
            });
        });
  
        if (prices.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giá cho sản phẩm nào trong các bảng giá.' });
        }
  
        res.status(200).json({
            success: true,
            message: 'Lấy giá sản phẩm thành công!',
            prices
        });
    } catch (error) {
        console.error("Error getting all active product prices:", error);
        res.status(500).json({ success: false, message: 'Không thể lấy giá sản phẩm', error: error.message });
    }
  };
  

  //cập status bảng giá
  exports.updatePriceListStatus = async (req, res) => {
    const { priceListId, isActive } = req.body; 

    // Kiểm tra ID bảng giá
    if (!mongoose.Types.ObjectId.isValid(priceListId)) {
        return res.status(400).json({ success: false, message: 'ID bảng giá không hợp lệ!' });
    }

    try {
        // Cập nhật trạng thái isActive của bảng giá trực tiếp
        const priceList = await PriceList.findByIdAndUpdate(
            priceListId,
            { isActive: isActive }, // Truyền giá trị boolean
            { new: true } 
        );

        // Kiểm tra xem bảng giá có tồn tại không
        if (!priceList) {
            return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
        }

        res.status(200).json({
            success: true,
            message: `Trạng thái bảng giá đã được cập nhật thành ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}.`,
            priceList
        });
    } catch (error) {
        console.error("Error updating price list status:", error);
        res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái bảng giá', error: error.message });
    }
};
