const Product = require('../../products/models/product'); 
const mongoose = require('mongoose'); 
const PriceList = require('../model/priceModels'); 
// Cập nhật bảng giá theo ID

exports.updatePriceList = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, isActive } = req.body; 

        if (!id) {
            return res.status(400).json({ success: false, message: 'Thiếu ID bảng giá.' });
        }

        const existingPriceList = await PriceList.findById(id);

        if (!existingPriceList) {
            return res.status(404).json({ success: false, message: 'Bảng giá không tìm thấy.' });
        }

        // Nếu bảng giá đang hoạt động
        if (existingPriceList.isActive) {
            // Chỉ cho phép cập nhật trạng thái hoạt động
            if (isActive !== undefined) {
                // Cập nhật trường isActive
                existingPriceList.isActive = isActive;
                await existingPriceList.save(); 
                return res.status(200).json({ success: true, message: 'Trạng thái hoạt động đã được cập nhật!', priceList: existingPriceList });
            } else {
                return res.status(400).json({ success: false, message: 'Không thể chỉnh sửa bảng giá đang hoạt động, chỉ được phép cập nhật trạng thái hoạt động.' });
            }
        }

        // Nếu bảng giá không hoạt động, cho phép cập nhật tất cả các trường
        const updateData = {
            code: code !== undefined ? code : existingPriceList.code,
            name: name !== undefined ? name : existingPriceList.name,
            description: description !== undefined ? description : existingPriceList.description,
            isActive: isActive !== undefined ? isActive : existingPriceList.isActive,
            // Không cập nhật startDate và endDate
        };

        const updatedPriceList = await PriceList.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Bảng giá đã được cập nhật!', priceList: updatedPriceList });
    } catch (error) {
        console.error("Error updating price list:", error);
        res.status(500).json({ success: false, message: 'Không thể cập nhật bảng giá', error: error.message });
    }
};



// Xóa bảng giá theo ID

exports.deletePriceList = async (req, res) => {
    const { id } = req.params;
    try {
        const priceList = await PriceList.findById(id);
        if (!priceList) {
            return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại.' });
        }
        if (priceList.isActive) {
            return res.status(400).json({ success: false, message: 'Không thể xóa bảng giá đang hoạt động.' });
        }
        await PriceList.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Bảng giá đã được xóa thành công.' });
    } catch (error) {
        console.error("Error deleting price list:", error);
        res.status(500).json({ success: false, message: 'Không thể xóa bảng giá', error: error.message });
    }
};
