const PriceList = require('../model/priceList'); 
const Product = require('../../products/models/product'); 

// Create a Price List
exports.createPriceList = async (req, res) => {
    try {
      const { code, name, startDate, endDate, isActive, description } = req.body;
  
      // Kiểm tra dữ liệu đầu vào
      if (!code || !name || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
      }
  
      // Create a new price list
      const newPriceList = new PriceList({
        code,
        name,
        startDate,
        endDate,
        isActive,
        description
      });
  
      await newPriceList.save();
  
      res.status(201).json({ success: true, message: 'Bảng giá đã được tạo!', priceList: newPriceList });
    } catch (error) {
      console.error(error); // Log error for debugging
      res.status(500).json({ success: false, message: 'Không thể tạo bảng giá', error: error.message });
    }
  };
  // Get all Price Lists
  exports.getAllPriceLists = async (req, res) => {
    try {
      const priceLists = await PriceList.find();
  
      res.status(200).json({ success: true, priceLists });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách bảng giá', error: error.message });
    }
  };
  
  // Get a Price List by ID
  exports.getPriceListById = async (req, res) => {
    try {
      const priceList = await PriceList.findById(req.params.id);
  
      if (!priceList) {
        return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }
  
      res.status(200).json({ success: true, priceList });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi tìm bảng giá', error: error.message });
    }
  };
  
  // Update a Price List
  exports.updatePriceList = async (req, res) => {
    try {
      const { code, name, startDate, endDate, isActive } = req.body;
      
      // Find the price list by ID and update it
      const updatedPriceList = await PriceList.findByIdAndUpdate(
        req.params.id,
        { code, name, startDate, endDate, isActive },
        { new: true }
      );
  
      if (!updatedPriceList) {
        return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }
  
      res.status(200).json({ success: true, message: 'Bảng giá đã được cập nhật!', priceList: updatedPriceList });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi cập nhật bảng giá', error: error.message });
    }
  };
  
  // Delete a Price List
  exports.deletePriceList = async (req, res) => {
    try {
      const priceList = await PriceList.findByIdAndDelete(req.params.id);
  
      if (!priceList) {
        return res.status(404).json({ success: false, message: 'Bảng giá không tồn tại!' });
      }
  
      res.status(200).json({ success: true, message: 'Bảng giá đã được xóa!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi xóa bảng giá', error: error.message });
    }
  };