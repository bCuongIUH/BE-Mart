const Product = require('../../products/models/product'); 
const mongoose = require('mongoose'); 
const PriceList = require('../model/priceModels'); 
// Cập nhật bảng giá theo ID

exports.updatePriceList = async (req, res) => {
  try {
      const { id } = req.params;
      const { code, name, description, isActive, startDate, endDate } = req.body; 

      if (!id) {
          return res.status(400).json({ success: false, message: 'Thiếu ID bảng giá.' });
      }

      const existingPriceList = await PriceList.findById(id);

      if (!existingPriceList) {
          return res.status(404).json({ success: false, message: 'Bảng giá không tìm thấy.' });
      }

      // Nếu bảng giá đang hoạt động
      if (existingPriceList.isActive) {
          // Cho phép cập nhật trạng thái hoạt động và ngày kết thúc
          if (isActive !== undefined || endDate !== undefined) {
              if (isActive !== undefined) {
                  existingPriceList.isActive = isActive;
              }
              if (endDate !== undefined) {
                  // Kiểm tra ngày kết thúc mới phải sau ngày bắt đầu
                  if (new Date(endDate) <= new Date(existingPriceList.startDate)) {
                      return res.status(400).json({ success: false, message: 'Ngày kết thúc phải sau ngày bắt đầu.' });
                  }
                  existingPriceList.endDate = endDate;
              }
              await existingPriceList.save();
              return res.status(200).json({ success: true, message: 'Bảng giá đã được cập nhật!', priceList: existingPriceList });
          } else {
              return res.status(400).json({ success: false, message: 'Không thể chỉnh sửa bảng giá đang hoạt động, chỉ được phép cập nhật trạng thái hoạt động và ngày kết thúc.' });
          }
      }

      // Nếu bảng giá không hoạt động, cho phép cập nhật tất cả các trường
      const updateData = {
          code: code !== undefined ? code : existingPriceList.code,
          name: name !== undefined ? name : existingPriceList.name,
          description: description !== undefined ? description : existingPriceList.description,
          isActive: isActive !== undefined ? isActive : existingPriceList.isActive,
          startDate: startDate !== undefined ? startDate : existingPriceList.startDate,
          endDate: endDate !== undefined ? endDate : existingPriceList.endDate,
      };

      // Kiểm tra ngày bắt đầu và kết thúc hợp lệ
      if (updateData.startDate && updateData.endDate) {
          if (new Date(updateData.endDate) <= new Date(updateData.startDate)) {
              return res.status(400).json({ success: false, message: 'Ngày kết thúc phải sau ngày bắt đầu.' });
          }
      }

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
        
        priceList.isDeleted = true;
        await priceList.save();

        res.status(200).json({ success: true, message: 'Bảng giá đã được xóa (soft delete) thành công.' });
    } catch (error) {
        console.error("Error soft deleting price list:", error);
        res.status(500).json({ success: false, message: 'Không thể xóa bảng giá', error: error.message });
    }
};


//
exports.deletePriceFromPriceList = async (req, res) => {
  const { priceListId, productId, priceId } = req.params;

  try {
    // Tìm `PriceList` theo ID
    const priceList = await PriceList.findById(priceListId);
    if (!priceList) {
      return res
        .status(404)
        .json({ success: false, message: "Bảng giá không tồn tại!" });
    }

    // Kiểm tra nếu bảng giá đang hoạt động
    if (priceList.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Không thể xóa giá khi bảng giá đang hoạt động!" });
    }

    // Tìm sản phẩm trong `products` theo `productId`
    const productIndex = priceList.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại trong bảng giá!",
      });
    }

    const product = priceList.products[productIndex];

    // Tìm và xóa giá cụ thể từ `prices` dựa trên `priceId`
    const priceIndex = product.prices.findIndex(
      (price) => price._id.toString() === priceId
    );
    if (priceIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Giá không tồn tại trong sản phẩm!" });
    }

    // Xóa giá từ `prices`
    product.prices.splice(priceIndex, 1);

    // Kiểm tra nếu `prices` rỗng sau khi xóa, xóa sản phẩm khỏi `products`
    if (product.prices.length === 0) {
      priceList.products.splice(productIndex, 1);
    }

    // Lưu thay đổi
    await priceList.save();
    res.status(200).json({
      success: true,
      message: "Giá đã được xóa khỏi sản phẩm trong bảng giá!",
      priceList,
    });
  } catch (error) {
    console.error("Error deleting price from price list:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa giá khỏi bảng giá",
      error: error.message,
    });
  }
};
