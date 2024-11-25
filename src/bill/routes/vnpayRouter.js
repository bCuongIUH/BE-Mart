const express = require("express");
const { createOrder, orderReturn } = require("../controllers/vnpayController");

const router = express.Router();

// Route cho getStatistics
router.get("/payment", createOrder);

// Route cho getDailyRevenue với query parameters startDate, endDate, userId
router.get("/paymentReturn", orderReturn);
module.exports = router;
