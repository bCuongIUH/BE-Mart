const Category = require('../models/category');

//lấy ds
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Không có nhóm hàng nào được tìm thấy' });
        }
        res.status(200).json({ message: 'Lấy danh sách nhóm hàng thành công', categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nhóm hàng', error: error.message });
    }
};
exports.getCategoriesName = async (req, res) => {
    try {
        const { name } = req.query;
        // Tìm kiếm nhóm hàng theo tên nếu có
        const filter = name ? { name: new RegExp(name, 'i') } : {}; // 
        const categories = await Category.find(filter);

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Không có nhóm hàng nào được tìm thấy' });
        }
        res.status(200).json({ message: 'Lấy danh sách nhóm hàng thành công', categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nhóm hàng', error: error.message });
    }
};

// Thêm nhóm hàng
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Nhóm hàng đã tồn tại' });
        }
        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.status(201).json({ message: 'Tạo nhóm hàng thành công', category: newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo nhóm hàng', error: error.message });
    }
};

// Sửa nhóm hàng
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;  
        const { name, description } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            id, 
            { name, description }, 
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Không tìm thấy nhóm hàng' });
        }

        res.status(200).json({ message: 'Cập nhật nhóm hàng thành công', category: updatedCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật nhóm hàng', error: error.message });
    }
};

// Xóa nhóm hàng
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params; 
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Không tìm thấy nhóm hàng' });
        }
        res.status(200).json({ message: 'Xóa nhóm hàng thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa nhóm hàng', error: error.message });
    }
};
