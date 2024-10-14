const mongoose = require('mongoose'); 
const uploadImageToCloudinary = require('../../upload/uploadImage');
const Category  = require('../models/category');
const Product  = require('../models/product');
const Unit = require('../models/unit');

exports.createProduct = async (req, res) => {
  try {
    const { code, barcode, name, description, categoryId , price, lines } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Cần upload ảnh cho sản phẩm' });
    }
    const imageUrl = await uploadImageToCloudinary(req.file.path, 'product_images');

    const newProduct = new Product({
      code,
      barcode,
      name,
      description: description || 'Mô tả mặc định',
      image: imageUrl,
      category: categoryId,
      price : 0,
      lines: lines || [] 
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
//câp nhật giá
exports.capnhatGia = async (req, res) => {
  const { id } = req.params; 
  const { price } = req.body; 

  try {
      const product = await Product.findById(id);
      if (!product) {
          return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }

      if (product.isAvailable) {
          return res.status(400).json({ message: 'Không thể cập nhật giá sản phẩm đang được bán.' });
      }
      product.price = price;
      await product.save(); 

      res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product });
  } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm: ' + error.message });
  }
};
//trạng thái
exports.capnhatTrangThai = async (req, res) => {
  const { id } = req.params; 
  const { isAvailable } = req.body; 
  try {
      const product = await Product.findById(id);
      if (!product) {
          return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }
      if (isAvailable && product.quantity === 0) {
          return res.status(400).json({ message: 'Không thể đặt trạng thái là "Đang bán" vì số lượng sản phẩm bằng 0.' });
      }
      if (isAvailable && (!product.price || product.price <= 0)) {
          return res.status(400).json({ message: 'Không thể đặt trạng thái là "Đang bán" vì giá sản phẩm không hợp lệ.' });
      }
      if (product.quantity === 0) {
          isAvailable = false;
      }

      product.isAvailable = isAvailable;
      await product.save(); 

      res.status(200).json({ message: 'Cập nhật trạng thái sản phẩm thành công', product });
  } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái sản phẩm: ' + error.message });
  }
};
