const Bill = require('../../bill/models/billModel');
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
    const { billId, reason, images } = req.body;
  
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
  
      // Tạo yêu cầu hoàn trả
      const returnRequest = new ReturnRequest({
        bill: billId,
        reason,
        images: images || [],
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
  
  // Xử lý trạng thái yêu cầu hoàn trả
  exports.handleReturnRequest = async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' hoặc 'reject'
  
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Hành động không hợp lệ.' });
    }
  
    try {
      // Lấy yêu cầu hoàn trả
      const returnRequest = await ReturnRequest.findById(requestId).populate('bill');
      if (!returnRequest) {
        return res.status(404).json({ message: 'Yêu cầu hoàn trả không tồn tại.' });
      }
  
      // Lấy hóa đơn liên quan
      const bill = await Bill.findById(returnRequest.bill);
      if (!bill) {
        return res.status(404).json({ message: 'Hóa đơn không tồn tại.' });
      }
  
      if (action === 'accept') {
        // Cập nhật trạng thái hóa đơn thành HoanTra
        bill.status = 'HoanTra';
      } else if (action === 'reject') {
        // Cập nhật trạng thái hóa đơn thành Canceled
        bill.status = 'Canceled';
      }
  
      await bill.save();
  
      res.status(200).json({
        message: `Yêu cầu trả hàng đã được ${action === 'accept' ? 'chấp nhận' : 'từ chối'}.`,
        data: bill,
      });
    } catch (error) {
      console.error('Lỗi khi xử lý yêu cầu trả hàng:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
    }
  };
  // Lấy tất cả yêu cầu trả hàng
exports.getAllReturnRequests = async (req, res) => {
    try {
      const returnRequests = await ReturnRequest.find().populate('bill');
      res.status(200).json({ data: returnRequests });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu cầu trả hàng:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
    }
  };