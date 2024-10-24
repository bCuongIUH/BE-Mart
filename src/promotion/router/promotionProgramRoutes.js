const express = require("express");
const router = express.Router();
const promotionProgramController = require("../controller/promotionProgramController");

// Tạo chương trình khuyến mãi mới
router.post("/", promotionProgramController.createPromotionProgram);

// Cập nhật chương trình khuyến mãi
router.put("/:id", promotionProgramController.updatePromotionProgram);

// Xóa chương trình khuyến mãi
router.delete("/:id", promotionProgramController.deletePromotionProgram);

// Lấy tất cả các chương trình khuyến mãi
router.get("/", promotionProgramController.getAllPromotionPrograms);
router.get("/active", promotionProgramController.getActivePromotionPrograms);
// Thay đổi trạng thái của chương trình khuyến mãi (isActive)
router.patch("/:id/status", promotionProgramController.changePromotionStatus);

module.exports = router;
