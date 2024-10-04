const Supplier = require('../models/supplier');

// Tạo nhà cung cấp mới
exports.addSupplier = async (req, res) => {
    try {
      const { name, contactInfo, email, phoneNumber } = req.body;
  
      
      if (!name) {
        return res.status(400).json({ message: 'Tên nhà cung cấp là bắt buộc.' });
      }
  
      const newSupplier = new Supplier({
        name,
        contactInfo,
        email,
        phoneNumber,
      });
  
      await newSupplier.save();
      res.status(201).json({ message: 'Nhà cung cấp đã được thêm thành công!', supplier: newSupplier });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm nhà cung cấp', error });
    }
  };
  

// Lấy tất cả nhà cung cấp
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error });
  }
};

// Lấy nhà cung cấp theo ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy nhà cung cấp', error });
  }
};

// Cập nhật nhà cung cấp
exports.updateSupplier = async (req, res) => {
  try {
    const { name, contactInfo, email, phoneNumber } = req.body;
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, contactInfo, email, phoneNumber },
      { new: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }
    res.status(200).json({ message: 'Cập nhật nhà cung cấp thành công', supplier: updatedSupplier });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật nhà cung cấp', error });
  }
};

// Xóa nhà cung cấp
exports.deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }
    res.status(200).json({ message: 'Xóa nhà cung cấp thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa nhà cung cấp', error });
  }
};
