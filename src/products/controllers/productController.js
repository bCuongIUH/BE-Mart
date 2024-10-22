const mongoose = require('mongoose'); 
const uploadImageToCloudinary = require('../../upload/uploadImage');
const Category  = require('../models/category');
const Product  = require('../models/product');
const Unit = require('../../unit/models/Unit');
const UnitLine = require('../../units/models/UnitLine');


// exports.createProduct = async (req, res) => {

//   try {
//      const { code, barcode, name, description, categoryId, lines, priceLists, supplierId, unitLineId } = req.body; 
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(400).json({ message: 'Danh mục không hợp lệ' });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: 'Cần upload ảnh cho sản phẩm' });
//     }

//     const imageUrl = await uploadImageToCloudinary(req.file.path, 'product_images');


//        const unitLine = await UnitLine.findById(unitLineId).populate('details');
//        if (!unitLine) {
//          return res.status(400).json({ message: 'Dòng đơn vị không hợp lệ' });
//        }

//     const newProduct = new Product({
//       code,
//       barcode,
//       name,
//       description: description || 'Mô tả mặc định',
//       image: imageUrl,
//       category: categoryId,
//       supplier: supplierId,
//       price: 0,
//       lines: lines || [],
//       priceLists: priceLists || [],
//       units: [{ unitLine: unitLineId, details: unitLine.details }]
//     });

//     await newProduct.save();

//     res.status(201).json({ message: 'Thêm sản phẩm thành công', product: newProduct });
//   } catch (error) {
//     console.error('Lỗi khi thêm sản phẩm:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
//   }
// };




exports.createProduct = async (req, res) => {
  try {
    const { code, barcode, name, description, categoryId, lines, priceLists, supplierId, unitLineId } = req.body; // Đảm bảo đã lấy supplierId từ req.body
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ' });
    }

    // Tìm kiếm dòng đơn vị
    const unitLine = await UnitLine.findById(unitLineId).populate('details'); // Populate chi tiết từ UnitDetail
    if (!unitLine) {
      return res.status(400).json({ message: 'Dòng đơn vị không hợp lệ' });
    }

    const newProduct = new Product({
      code,
      barcode,
      name,
      description: description || 'Mô tả mặc định',
      category: categoryId,
      supplier: supplierId, // Thêm trường nhà cung cấp
      price: 0,
      lines: lines || [],
      priceLists: priceLists || [],
      units: [{ unitLine: unitLineId, details: unitLine.details }] // Thêm details vào units
    });

    await newProduct.save();

    res.status(201).json({ message: 'Thêm sản phẩm thành công', product: newProduct });
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

//xóa sp
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.status(200).json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error });
  }
};
//cập nhật
exports.updateProduct = async (req, res) => {
  try {
    const {code, barcode, name, description, categoryId } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
if (!mongoose.Types.ObjectId.isValid(categoryId)) {
  return res.status(400).json({ message: 'Danh mục không hợp lệ' });
}
const category = await Category.findById(categoryId);
if (!category) {
  return res.status(400).json({ message: 'Danh mục không tồn tại' });
}
    let imageUrl = product.image;
    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file.path, 'product_images'); 
    }

    // Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        code: code || product.code,
        barcode: barcode || product.barcode,
        name: name || product.name, 
        description: description || product.description, 
        category: categoryId || product.category, 
        image: imageUrl 
      },
      { new: true }
    );
  
    
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
  }
};
// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error });
  }
};

// Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error });
  }
};
//nhập hàng
exports.nhapHang = async (req, res) => {
  const { id } = req.params; // Lấy ID từ params
  const { supplierId, quantity, unitPrice, unitId } = req.body; 

  try {
      // Tìm sản phẩm theo ID
      const product = await Product.findById(id);
      if (!product) {
          return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }
      // const unit = await Unit.findById(unitId);
      // if (!unit) {
      //     return res.status(404).json({ message: 'Đơn vị tính ko tồn tại' });
      // }

      // Tính toán totalPrice
      const totalPrice = unitPrice * quantity;

      // Thêm một ProductLine mới vào sản phẩm
      product.lines.push({
          supplierId,
          quantity,
          //unitPrice,
          totalPrice,
          isAvailable: quantity > 0,
          //unitId
      });
      
      // Lưu sản phẩm đã được cập nhật
      await product.save();

      return res.status(200).json({ message: 'Nhập hàng thành công', product });
  } catch (error) {
      console.error('Lỗi khi nhập hàng:', error);
      return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm đơn vị vào sản phẩm
exports.addUnitToProduct = async (req, res) => {
  try {
      const { productId, unitId } = req.body;

      // Tìm sản phẩm theo ID
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }

      // Tìm đơn vị theo ID
      const unit = await Unit.findById(unitId);
      if (!unit) {
          return res.status(404).json({ message: 'Đơn vị không tồn tại' });
      }

      // Kiểm tra nếu đơn vị đã tồn tại trong sản phẩm
      if (product.units.includes(unitId)) {
          return res.status(400).json({ message: 'Đơn vị đã tồn tại trong sản phẩm này' });
      }

      // Thêm đơn vị vào sản phẩm
      product.units.push(unitId);
      await product.save();

      return res.status(200).json({ message: 'Đơn vị đã được thêm vào sản phẩm', product });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi máy chủ', error });
  }
};
