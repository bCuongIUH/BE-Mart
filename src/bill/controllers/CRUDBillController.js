const Bill = require('../../bill/models/billModel');
const uploadImageToCloudinary = require('../../upload/uploadImage');
const ReturnRequest = require('../models/ReturnRequest');

// Hàm xóa hóa đơn
exports.deleteBill = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updatedBill = await Bill.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
      console.log('Bill deleted:', updatedBill);
      if (!updatedBill) {
        return res.status(404).json({ message: 'Hóa đơn không tồn tại.' });
      }
  
      res.status(200).json({ message: 'Hóa đơn đã được đánh dấu là đã xóa.', bill: updatedBill });
    } catch (error) {
      console.error('Lỗi khi xóa hóa đơn:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa hóa đơn.' });
    }
  };
  


// Tạo yêu cầu trả hàng
exports.createReturnRequest = async (req, res) => {
  const { billId, reason } = req.body;
  console.log('File uploaded:', req.body);
  if (!billId || !reason) {
      return res.status(400).json({ message: 'Thiếu thông tin hóa đơn hoặc lý do trả hàng.' });
  }

  try {
      // Kiểm tra hóa đơn
      const bill = await Bill.findById(billId);
      if (!bill) {
          return res.status(404).json({ message: 'Hóa đơn không tồn tại.' });
      }

      // Nếu hóa đơn đã ở trạng thái HoanTra hoặc Canceled, không thể yêu cầu hoàn trả nữa
      if (['HoanTra', 'Canceled'].includes(bill.status)) {
          return res.status(400).json({ message: 'Không thể tạo yêu cầu hoàn trả cho hóa đơn đã xử lý.' });
      }

      let uploadedImages = [];
      if (req.file) {
          // Upload ảnh lên Cloudinary
          const uploadedUrl = await uploadImageToCloudinary(req.file.path, 'return-requests');
          uploadedImages.push(uploadedUrl);
      }

      // Tạo yêu cầu hoàn trả
      const returnRequest = new ReturnRequest({
          bill: billId,
          reason,
          images: uploadedImages,
      });

      // Lưu yêu cầu hoàn trả
      await returnRequest.save();

      // Cập nhật trạng thái hóa đơn thành DangXuLy
      bill.status = 'DangXuLy';
      await bill.save();

      res.status(201).json({
          message: 'Yêu cầu trả hàng đã được tạo thành công.',
          data: returnRequest,
      });
  } catch (error) {
      console.error('Lỗi khi tạo yêu cầu trả hàng:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
  }
};

  
 
  // Lấy tất cả yêu cầu trả hàng
  exports.getAllReturnRequests = async (req, res) => {
    try {
      const billsWithReturnRequests = await Bill.aggregate([
        {
          $match: {
            purchaseType: 'Online',
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: 'returnrequests', // Collection của ReturnRequest
            localField: '_id', // Trường để nối
            foreignField: 'bill', // Trường trong ReturnRequest liên kết với Bill
            as: 'returnRequests', // Kết quả trả về
          },
        },
        {
          $project: {
            _id: 1,
            customer: 1,
            items: 1,
            totalAmount: 1,
            status: 1,
            paymentMethod: 1,
            purchaseType: 1,
            isDeleted: 1,
            createdAt: 1,
            billCode: 1,
            returnRequests: 1, // Bao gồm các yêu cầu trả hàng liên kết
          },
        },
      ]);
  
      res.status(200).json({
        data: billsWithReturnRequests,
        message: 'Danh sách hóa đơn mua Online cùng với thông tin yêu cầu hoàn trả.',
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn có yêu cầu hoàn trả:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
    }
  };

  //cập nhật trạng thái của bill
  exports.updateBillStatusOnl = async (req, res) => {
    const { billId, action } = req.body;
  console.log(req.body);
  
    if (!billId || !action) {
      return res.status(400).json({ message: "Thiếu thông tin hóa đơn hoặc hành động." });
    }
  
    try {
      // Lấy thông tin hóa đơn
      const bill = await Bill.findById(billId);
      if (!bill) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
      }
  
      // Xử lý cập nhật trạng thái
      let updatedStatus = "";
      if (bill.status === "DangXuLy") {
        updatedStatus = action === "accept" ? "KiemHang" : "Canceled";
      } else if (bill.status === "KiemHang") {
        updatedStatus = action === "accept" ? "HoanTra" : "Canceled";
      } else {
        return res.status(400).json({ message: "Trạng thái hiện tại không thể cập nhật." });
      }
  
      // Cập nhật trạng thái hóa đơn
      bill.status = updatedStatus;
      await bill.save();
  
      res.status(200).json({
        success: true,
        message: `Trạng thái hóa đơn đã được cập nhật thành công: ${updatedStatus}`,
        data: bill,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái hóa đơn:", error);
      res.status(500).json({ message: "Đã xảy ra lỗi, vui lòng thử lại sau." });
    }
  };