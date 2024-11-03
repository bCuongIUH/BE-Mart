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
  