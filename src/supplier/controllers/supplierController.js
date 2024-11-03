const Supplier = require('../models/supplier');

// Tạo nhà cung cấp mới
// Thêm mới nhà cung cấp
exports.addSupplier = async (req, res) => {
  try {
    const { name, contactInfo, email, phoneNumber } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tên nhà cung cấp là bắt buộc.' });
    }

    // Kiểm tra trùng lặp cho từng trường riêng biệt
    if (await Supplier.findOne({ name })) {
      return res.status(400).json({ message: 'Tên nhà cung cấp đã tồn tại.' });
    }

    if (email && (await Supplier.findOne({ email }))) {
      return res.status(400).json({ message: 'Email nhà cung cấp đã tồn tại.' });
    }

    if (phoneNumber && (await Supplier.findOne({ phoneNumber }))) {
      return res.status(400).json({ message: 'Số điện thoại nhà cung cấp đã tồn tại.' });
    }

    // Tạo nhà cung cấp mới nếu không có trùng lặp
    const newSupplier = new Supplier({
      name,
      contactInfo,
      email,
      phoneNumber,
    });

    await newSupplier.save();
    res.status(201).json({
      message: 'Nhà cung cấp đã được thêm thành công!',
      supplier: newSupplier,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm nhà cung cấp', error });
  }
};


// Lấy tất cả nhà cung cấp chưa bị xóa
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isDeleted: false }); // Lấy danh sách nhà cung cấp chưa bị xóa
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error });
  }
};

// Lấy nhà cung cấp theo ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, isDeleted: false });
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

    // Kiểm tra trùng lặp khi cập nhật
    const existingSupplier = await Supplier.findOne({
      $or: [{ name }, { email }, { phoneNumber }],
      _id: { $ne: req.params.id }, // Loại bỏ nhà cung cấp hiện tại khỏi kiểm tra trùng lặp
    });

    if (existingSupplier) {
      return res.status(400).json({
        message: 'Tên, email hoặc số điện thoại đã tồn tại với một nhà cung cấp khác.',
      });
    }

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

// Chuyển `isDeleted` thành true khi xóa
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }

    res.status(200).json({ message: 'Nhà cung cấp đã được đánh dấu là đã xóa.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa nhà cung cấp', error });
  }
};