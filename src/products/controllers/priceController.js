const mongoose = require('mongoose'); 
const Product  = require('../models/product');
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
  //cập nhật khoản giá
  exports.capnhatKhoangGia= async (req, res) => {
    const productId = req.params.id;
    const { price, startDate, endDate } = req.body; 

    try {

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.priceRanges.push({
            price,
            startDate,
            endDate,
            isActive: true
        });

        // Save the updated product
        await product.save();
        
        res.json(product); // Return the updated product
    } catch (error) {
        console.error("Error updating product price range:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật khoảng giá' });
    }
  }
  // Hàm để cập nhật trạng thái isActive của khoảng giá
  exports.updatePriceActive = async (req, res) => {
    const { id } = req.params;
    const { priceRangeId } = req.body; 
  
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
  
        // Tìm khoảng giá trong priceRanges
        const priceRange = product.priceRanges.id(priceRangeId);
        if (!priceRange) {
            return res.status(404).json({ message: 'Khoảng giá không tồn tại' });
        }
  
        // Cập nhật isActive thành false
        priceRange.isActive = false;
  
        await product.save();
        res.status(200).json({ message: 'Cập nhật khoảng giá thành công', product });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật khoảng giá: ' + error.message });
    }
  };