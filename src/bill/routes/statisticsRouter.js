const express = require("express");
const {
  getStatistics,
  getDailyRevenue,
  getCustomerStatistics,
  getVoucherStatistics,
} = require("../controllers/statisticsController");

const router = express.Router();

// Route cho getStatistics
router.get("/", getStatistics);

// Route cho getDailyRevenue với query parameters startDate, endDate, userId
router.get("/daily-revenue", getDailyRevenue);

// Route cho getCustomerStatistics với query parameters startDate, endDate, customerId
router.get("/customer-statistics", getCustomerStatistics);

router.get("/voucher-statistics", getVoucherStatistics);
module.exports = router;
