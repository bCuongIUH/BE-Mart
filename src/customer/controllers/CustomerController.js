const Customer = require('../models/Customer'); 

exports.getAllCustomers = async (req, res) => {
    try {
      const activeCustomers = await Customer.find({ isDeleted: false }); 
      res.status(200).json(activeCustomers);
    } catch (error) {
      console.error("Error fetching active customers:", error);
      res.status(500).json({ message: "Có lỗi xảy ra khi lấy danh sách khách hàng đang hoạt động" });
    }
  };

  exports.updateCustomer = async (req, res) => {
    const customerId = req.params.id; 
    const { fullName, dateOfBirth, addressLines } = req.body; // Chỉ nhận các trường có thể cập nhật
  
    try {
      // Tìm và cập nhật thông tin người dùng (không bao gồm email và phoneNumber)
      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        {
          $set: {
            fullName,
            dateOfBirth,
            addressLines
          }
        },
        { new: true, runValidators: true } // Trả về tài liệu đã cập nhật và kiểm tra tính hợp lệ
      );
  
      if (!updatedCustomer) {
        return res.status(404).json({ message: 'Khách hàng không tồn tại.' });
      }
  
      res.json({
        message: 'Cập nhật thông tin khách hàng thành công.',
        data: updatedCustomer
      });
    } catch (error) {
      res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật thông tin khách hàng.', error });
    }
  };