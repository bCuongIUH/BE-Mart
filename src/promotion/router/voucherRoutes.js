const express = require("express");
const router = express.Router();
const voucherController = require("../controller/voucherController");

// Lấy danh sách voucher theo chương trình khuyến mãi
router.get("/promotion/:promotionProgramId", voucherController.getVoucherByPromotionProgramId);
router.get("/promotion/list/active", voucherController.getAllActiveVouchers);
// Tạo mới voucher
router.post("/", voucherController.createVoucher);

// Cập nhật voucher
router.put("/:id", voucherController.updateVoucher);

// Xóa voucher
router.delete("/:id", voucherController.deleteVoucher);

// Thay đổi trạng thái của voucher
router.patch("/:id/status", voucherController.changeVoucherStatus);

module.exports = router;
