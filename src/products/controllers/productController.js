const mongoose = require('mongoose'); 
const uploadImageToCloudinary = require('../../upload/uploadImage');
const Category  = require('../models/category');
const Product  = require('../models/product');
const Supplier = require('../../supplier/models/supplier')

//thêm mới
exports.createProduct = async (req, res) => {
  try {
      const { code, barcode, name, description, categoryId, supplierId, baseUnit, conversionUnits } = req.body;
      console.log(req.body);

      // Kiểm tra xem có tệp ảnh được upload hay không
      if (!req.file) {
          return res.status(400).json({ message: 'Cần upload ảnh cho sản phẩm' });
      }

      // Upload ảnh sản phẩm lên Cloudinary
      const imageUrl = await uploadImageToCloudinary(req.file.path, 'product_images');

      // Kiểm tra tính duy nhất của tất cả mã barcode
      const allBarcodes = [barcode, baseUnit.barcode, ...(conversionUnits || []).map(unit => unit.barcode)];
      const uniqueBarcodes = new Set(allBarcodes);
      if (allBarcodes.length !== uniqueBarcodes.size) {
          return res.status(400).json({ message: 'Các barcode phải là duy nhất.' });
      }

      // Kiểm tra xem category và supplier có hợp lệ không
      const category = await Category.findById(categoryId);
      if (!category) {
          return res.status(400).json({ message: 'category không hợp lệ' });
      }
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
          return res.status(400).json({ message: 'supplier không hợp lệ' });
      }

      // Tạo sản phẩm với các thông tin đã cung cấp
      const product = new Product({
          code,
          barcode,
          name,
          description,
          image: imageUrl,
          category: categoryId,
          supplier: supplierId,
          baseUnit: {
              name: baseUnit.name,
              conversionValue: baseUnit.conversionValue || 1, 
              barcode: barcode 
          },
          conversionUnits: Array.isArray(conversionUnits) && conversionUnits.length > 0 ? 
              conversionUnits.map(unit => ({
                  name: unit.name,
                  conversionValue: unit.conversionValue || 1, 
                  barcode: unit.barcode
                  // image: imageUrl, // Nếu cần thiết, có thể thêm vào
              })) :[], 
      });

      // Lưu sản phẩm vào cơ sở dữ liệu
      await product.save();

      res.status(201).json({ message: 'Sản phẩm đã được tạo thành công.', product });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi trong khi tạo sản phẩm.', error });
  }
};


//xóa sp
exports.deleteProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    
    product.isDeleted = true;
    await product.save();

    res.status(200).json({ message: 'Đã xóa  sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa  sản phẩm', error });
  }
};

//cập nhật


exports.updateProduct = async (req, res) => {
  try {
    const {
      code,
      barcode,
      name,
      description,
      supplierId,
      categoryId,
      baseUnit,
      conversionUnits,
    } = req.body;
 
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Kiểm tra ID danh mục và nhà cung cấp có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Danh mục không hợp lệ" });
    }
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return res.status(400).json({ message: "Nhà cung cấp không hợp lệ" });
    }

    // Kiểm tra xem danh mục và nhà cung cấp có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Danh mục không tồn tại" });
    }
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(400).json({ message: "Nhà cung cấp không tồn tại" });
    }

    // Xử lý ảnh nếu có tải lên
    let imageUrl = product.image;
    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file.path, "product_images");
    }

    // Chuẩn bị dữ liệu cập nhật
    const updatedData = {
      code: code || product.code,
      barcode: barcode || product.barcode,
      name: name || product.name,
      description: description || product.description,
      supplier: supplierId || product.supplier,
      category: categoryId || product.category,
      image: imageUrl,
      baseUnit: {
        name: baseUnit?.name || product.baseUnit.name,
        conversionValue: baseUnit?.conversionValue || product.baseUnit.conversionValue,
        barcode: baseUnit?.barcode || product.baseUnit.barcode,
      },
      conversionUnits: conversionUnits || product.conversionUnits,
    };

    // Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    res.status(200).json({ message: "Cập nhật sản phẩm thành công", product: updatedProduct });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
};
// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false });
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error });
  }
};

//
exports.getProductByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const product = await Product.findOne({ code, isDeleted: false }); 

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' }); 
    }

    res.status(200).json(product); 
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error });
  }
};

exports.getAllProductsPOP = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name _id") 
      .populate("supplier", "name _id") 
      .populate("units.unitLine", "name _id") 
      .populate({
        path: "units.details", 
        select: "name value", 
      });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error });
  }
};


// Lấy sản phẩm theo category
exports.getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;  

  try {
    // Tìm tất cả sản phẩm có category tương ứng
    const products = await Product.find({ category: categoryId });

    // Kiểm tra xem có sản phẩm nào không
    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào cho danh mục này.' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm theo danh mục', error });
  }
};

