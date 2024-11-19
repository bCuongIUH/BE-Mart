// const PriceList = require('../model/priceList'); 
const Product = require('../../products/models/product'); 
const mongoose = require('mongoose'); 
const PriceList = require('../model/priceModels'); 
const cron = require('node-cron');
const Stock = require('../../warehouse/models/Stock');

//lấy ds bảng giá
exports.getAllPriceLists = async (req, res) => {
    try {
        const priceLists = await PriceList.find({ isDeleted: false });

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


//THÊM GIÁ VÀO BẢNG
exports.addPricesToPriceList = async (req, res) => {
  const { priceListId, products } = req.body;

  try {
    // Find the price list by ID
    const priceList = await PriceList.findById(priceListId);

    if (!priceList) {
      return res.status(404).json({ success: false, message: "Bảng giá không tồn tại!" });
    }
    if (priceList.isActive) {
      return res.status(400).json({ success: false, message: 'Bảng giá đang hoạt động, không thể thêm hoặc cập nhật giá!' });
    }

    for (const product of products) {
      const { productId, prices } = product;

      // Check if the product exists
      const foundProduct = await Product.findById(productId).populate("baseUnit conversionUnits");
      if (!foundProduct) {
        return res.status(404).json({ success: false, message: `Sản phẩm với ID ${productId} không tồn tại!` });
      }

      // Get all available units for validation
      const baseUnitName = foundProduct.baseUnit.name;
      const availableUnits = foundProduct.conversionUnits.map((unit) => unit.name);
      const allUnits = [baseUnitName, ...availableUnits];

      // Validate that the prices have valid units
      const invalidPrices = prices.filter((price) => !allUnits.includes(price.unitName));
      if (invalidPrices.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Có đơn vị không hợp lệ trong danh sách giá",
          invalidUnits: invalidPrices,
        });
      }

      // Check for existing active or overlapping price lists with the same product
      const existingPriceLists = await PriceList.find({
        _id: { $ne: priceListId }, // Exclude the current price list
        "products.productId": productId,
        isDeleted: false,
        startDate: { $lte: priceList.endDate },
        endDate: { $gte: priceList.startDate },
      });

      if (existingPriceLists.length > 0) {
        // If the product is found in another active price list, prevent the update
        return res.status(400).json({
          success: false,
          message: `Sản phẩm với ID ${productId} đã tồn tại trong một bảng giá khác có thời gian trùng lặp. Không thể thêm hoặc cập nhật giá.`,
        });
      }

      // If the product isn't in any overlapping lists, add or update in the current price list
      const existingProductIndex = priceList.products.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (existingProductIndex !== -1) {
        // If the product already exists in the current list, update prices
        const existingProduct = priceList.products[existingProductIndex];

        prices.forEach((price) => {
          const priceIndex = existingProduct.prices.findIndex(
            (p) => p.unitName === price.unitName
          );
          if (priceIndex !== -1) {
            existingProduct.prices[priceIndex].price = price.price;
          } else {
            existingProduct.prices.push(price);
          }
        });
      } else {
        // If the product doesn't exist, add it with the specified prices
        priceList.products.push({ productId, prices });
      }
    }

    await priceList.save();
    res.status(200).json({
      success: true,
      message: "Giá đã được thêm hoặc cập nhật vào bảng giá!",
      priceList,
    });
  } catch (error) {
    console.error("Error adding prices to price list:", error);
    res.status(500).json({
      success: false,
      message: "Không thể thêm hoặc cập nhật giá vào bảng giá",
      error: error.message,
    });
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
            { isActive: isActive }, 
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


// exports.getActiveProductPrices = async (req, res) => {
//   try {
//     const currentDate = new Date();

//     // Tìm tất cả các bảng giá đang hoạt động
//     const activePriceLists = await PriceList.find({
//       startDate: { $lte: currentDate },
//       endDate: { $gte: currentDate },
//       isActive: true
//     });

//     // Lấy tất cả sản phẩm và thông tin tồn kho
//     const products = await Product.find({ isDeleted: false })
//       .populate('baseUnit conversionUnits category supplier')
//       .lean();  // Sử dụng lean() để trả về dữ liệu thuần túy

//     const stocks = await Stock.find();

//     const prices = [];

//     // Duyệt qua từng bảng giá hoạt động để lấy giá của các sản phẩm
//     activePriceLists.forEach(priceList => {
//       priceList.products.forEach(p => {
//         const product = products.find(prod => prod._id.toString() === p.productId.toString());

//         if (product) {
//           const productStocks = stocks.filter(s => s.productId.toString() === p.productId.toString());

//           const priceObj = {
//             productId: p.productId,
//             image: product.image,
//             description: product.description,
//             productName: product.name,
//             category: product.category ? product.category.name : null, // Lấy tên danh mục
//             supplier: product.supplier ? product.supplier.name : null, // Lấy tên nhà cung cấp
//             units: []
//           };

//           // Đơn vị cơ bản
//           const baseUnitStock = productStocks.find(s => s.unit === product.baseUnit.name);
//           priceObj.units.push({
//             unitName: product.baseUnit.name,
//             quantity: baseUnitStock ? baseUnitStock.quantity : 0,
//             price: p.prices.find(price => price.unitName === product.baseUnit.name)?.price || 0,
//             conversionValue: product.baseUnit.conversionValue
//           });

//           // Đơn vị quy đổi
//           product.conversionUnits.forEach(unit => {
//             const conversionUnitStock = productStocks.find(s => s.unit === unit.name);
//             priceObj.units.push({
//               unitName: unit.name,
//               quantity: conversionUnitStock ? conversionUnitStock.quantity : 0,
//               price: p.prices.find(price => price.unitName === unit.name)?.price || 0,
//               conversionValue: unit.conversionValue
//             });
//           });

//           prices.push(priceObj);
//         }
//       });
//     });

//     // Xử lý các sản phẩm không có trong bảng giá nào
//     products.forEach(product => {
//       if (!prices.some(price => price.productId.toString() === product._id.toString())) {
//         const productStocks = stocks.filter(s => s.productId.toString() === product._id.toString());

//         const priceObj = {
//           productId: product._id,
//           image: product.image,
//           description: product.description,
//           productName: product.name,
//           category: product.category ? product.category.name : null,
//           supplier: product.supplier ? product.supplier.name : null,
//           units: []
//         };

//         // Đơn vị cơ bản với giá bằng 0
//         const baseUnitStock = productStocks.find(s => s.unit === product.baseUnit.name);
//         priceObj.units.push({
//           unitName: product.baseUnit.name,
//           quantity: baseUnitStock ? baseUnitStock.quantity : 0,
//           price: 0,
//           conversionValue: product.baseUnit.conversionValue
//         });

//         // Đơn vị quy đổi với giá bằng 0
//         product.conversionUnits.forEach(unit => {
//           const conversionUnitStock = productStocks.find(s => s.unit === unit.name);
//           priceObj.units.push({
//             unitName: unit.name,
//             quantity: conversionUnitStock ? conversionUnitStock.quantity : 0,
//             price: 0,
//             conversionValue: unit.conversionValue
//           });
//         });

//         prices.push(priceObj);
//       }
//     });

//     if (prices.length === 0) {
//       return res.status(404).json({ success: false, message: 'Không tìm thấy giá cho sản phẩm nào trong các bảng giá.' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Lấy giá sản phẩm thành công!',
//       prices
//     });
//   } catch (error) {
//     console.error("Error getting all active product prices:", error);
//     res.status(500).json({ success: false, message: 'Không thể lấy giá sản phẩm', error: error.message });
//   }
// };
exports.getActiveProductPrices = async (req, res) => {
  try {
    const currentDate = new Date();

    // Tìm tất cả các bảng giá đang hoạt động
    const activePriceLists = await PriceList.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      isActive: true
    });

    // Lấy tất cả sản phẩm và thông tin tồn kho
    const products = await Product.find({ isDeleted: false })
      .populate('baseUnit conversionUnits category supplier')
      .lean(); // Sử dụng lean() để trả về dữ liệu thuần túy

    const stocks = await Stock.find();

    const prices = [];

    // Duyệt qua từng bảng giá hoạt động để lấy giá của các sản phẩm
    activePriceLists.forEach(priceList => {
      priceList.products.forEach(p => {
        const product = products.find(prod => prod._id.toString() === p.productId.toString());

        if (product) {
          const productStocks = stocks.filter(s => s.productId.toString() === p.productId.toString());

          const priceObj = {
            productId: p.productId,
            code: product.code, // Thêm mã code của sản phẩm
            image: product.image,
            description: product.description,
            productName: product.name,
            category: product.category ? product.category.name : null, // Lấy tên danh mục
            supplier: product.supplier ? product.supplier.name : null, // Lấy tên nhà cung cấp
            units: []
          };

          // Đơn vị cơ bản
          const baseUnitStock = productStocks.find(s => s.unit === product.baseUnit.name);
          priceObj.units.push({
            unitName: product.baseUnit.name,
            barcode: product.baseUnit.barcode, // Thêm barcode cho đơn vị cơ bản
            quantity: baseUnitStock ? baseUnitStock.quantity : 0,
            price: p.prices.find(price => price.unitName === product.baseUnit.name)?.price || 0,
            conversionValue: product.baseUnit.conversionValue
          });

          // Đơn vị quy đổi
          product.conversionUnits.forEach(unit => {
            const conversionUnitStock = productStocks.find(s => s.unit === unit.name);
            priceObj.units.push({
              unitName: unit.name,
              barcode: unit.barcode, // Thêm barcode cho đơn vị quy đổi
              quantity: conversionUnitStock ? conversionUnitStock.quantity : 0,
              price: p.prices.find(price => price.unitName === unit.name)?.price || 0,
              conversionValue: unit.conversionValue
            });
          });

          prices.push(priceObj);
        }
      });
    });

    // Xử lý các sản phẩm không có trong bảng giá nào
    products.forEach(product => {
      if (!prices.some(price => price.productId.toString() === product._id.toString())) {
        const productStocks = stocks.filter(s => s.productId.toString() === product._id.toString());

        const priceObj = {
          productId: product._id,
          code: product.code, // Thêm mã code của sản phẩm
          image: product.image,
          description: product.description,
          productName: product.name,
          category: product.category ? product.category.name : null,
          supplier: product.supplier ? product.supplier.name : null,
          units: []
        };

        // Đơn vị cơ bản với giá bằng 0
        const baseUnitStock = productStocks.find(s => s.unit === product.baseUnit.name);
        priceObj.units.push({
          unitName: product.baseUnit.name,
          barcode: product.baseUnit.barcode, // Thêm barcode cho đơn vị cơ bản
          quantity: baseUnitStock ? baseUnitStock.quantity : 0,
          price: 0,
          conversionValue: product.baseUnit.conversionValue
        });

        // Đơn vị quy đổi với giá bằng 0
        product.conversionUnits.forEach(unit => {
          const conversionUnitStock = productStocks.find(s => s.unit === unit.name);
          priceObj.units.push({
            unitName: unit.name,
            barcode: unit.barcode, // Thêm barcode cho đơn vị quy đổi
            quantity: conversionUnitStock ? conversionUnitStock.quantity : 0,
            price: 0,
            conversionValue: unit.conversionValue
          });
        });

        prices.push(priceObj);
      }
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
