const Product = require('../models/product');

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, image, saleStartDate, saleEndDate } = req.body;
    
    const newProduct = new Product({
      name,
      price,
      description,
      image,
      saleStartDate,
      saleEndDate
    });
    
    await newProduct.save();
    res.status(201).json({ message: 'Sản phẩm đã được tạo thành công', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error });
  }
};

// Lấy danh sách sản phẩm
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

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, saleStartDate, saleEndDate } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, image, saleStartDate, saleEndDate },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error });
  }
};

// Xóa sản phẩm
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
