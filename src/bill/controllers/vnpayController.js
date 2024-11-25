const {
  createOrderService,
  orderReturnService,
} = require("../../config/vnpayService");

// Tạo URL thanh toán
exports.createOrder = async (req, res) => {
  try {
    const { amount, orderInfo, returnUrl } = req.query;

    // Kiểm tra thông tin bắt buộc
    if (!amount || !orderInfo || !returnUrl) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin thanh toán bắt buộc." });
    }

    // Tạo URL thanh toán
    const paymentUrl = await createOrderService(
      req,
      parseInt(amount),
      orderInfo,
      returnUrl
    );

    res.status(200).json({
      message: "Tạo URL thanh toán thành công.",
      paymentUrl,
    });
  } catch (error) {
    console.error("Error creating payment URL:", error);
    res.status(500).json({ message: "Lỗi khi tạo URL thanh toán.", error });
  }
};
// Xử lý phản hồi từ VNPay
exports.orderReturn = async (req, res) => {
  try {
    // Gọi service để xử lý phản hồi
    const result = await orderReturnService(req);

    // Trả về phản hồi tùy thuộc vào kết quả
    switch (result) {
      case 1:
        res
          .status(200)
          .json({ status: "SUCCESS", message: "Giao dịch thành công!" });
        break;
      case 0:
        res
          .status(400)
          .json({ status: "FAILED", message: "Giao dịch thất bại!" });
        break;
      default:
        res
          .status(400)
          .json({ status: "INVALID", message: "Giao dịch không hợp lệ!" });
        break;
    }
  } catch (error) {
    console.error("Error handling payment return:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Lỗi khi xử lý phản hồi thanh toán.",
      error,
    });
  }
};
