const Customer = require("../../customer/models/Customer");
const Product = require("../../products/models/product");
const Bill = require("../models/billModel");
const mongoose = require("mongoose");

const getStatistics = async (req, res) => {
  try {
    // Khởi tạo thời gian hiện tại ở múi giờ Việt Nam (UTC+7)
    const now = new Date();
    const vietnamTimezoneOffset = 7 * 60 * 60 * 1000;

    const today = new Date(now.getTime() + vietnamTimezoneOffset);
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const startOfMonth = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
    );

    const startOfLastMonth = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)
    );
    const endOfLastMonth = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0)
    );

    const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
    const startOfLastYear = new Date(
      Date.UTC(today.getUTCFullYear() - 1, 0, 1)
    );
    const endOfLastYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 0));

    // 1. Doanh thu hôm nay (Offline) sau khi trừ chiết khấu
    const todayRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(today.getTime() - vietnamTimezoneOffset),
            $lt: new Date(
              today.getTime() + 24 * 60 * 60 * 1000 - vietnamTimezoneOffset
            ),
          },
          purchaseType: "Offline",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $subtract: ["$totalAmount", "$discountAmount"] },
          },
        },
      },
    ]);

    // 2. Doanh thu hôm qua (Offline) sau khi trừ chiết khấu
    const yesterdayRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(yesterday.getTime() - vietnamTimezoneOffset),
            $lt: new Date(today.getTime() - vietnamTimezoneOffset),
          },
          purchaseType: "Offline",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $subtract: ["$totalAmount", "$discountAmount"] },
          },
        },
      },
    ]);

    const todayGrowth = yesterdayRevenue[0]?.totalAmount
      ? (((todayRevenue[0]?.totalAmount || 0) -
          yesterdayRevenue[0].totalAmount) /
          yesterdayRevenue[0].totalAmount) *
        100
      : null;

    // 3. Doanh thu tháng này (Offline) sau khi trừ chiết khấu
    const currentMonthRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startOfMonth.getTime() - vietnamTimezoneOffset),
            $lt: new Date(
              today.getTime() + 24 * 60 * 60 * 1000 - vietnamTimezoneOffset
            ),
          },
          purchaseType: "Offline",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $subtract: ["$totalAmount", "$discountAmount"] },
          },
        },
      },
    ]);

    // 4. Doanh thu tháng trước (Offline) sau khi trừ chiết khấu
    const lastMonthRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startOfLastMonth.getTime() - vietnamTimezoneOffset),
            $lt: new Date(
              endOfLastMonth.getTime() +
                24 * 60 * 60 * 1000 -
                vietnamTimezoneOffset
            ),
          },
          purchaseType: "Offline",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $subtract: ["$totalAmount", "$discountAmount"] },
          },
        },
      },
    ]);

    const monthlyGrowth = lastMonthRevenue[0]?.totalAmount
      ? (((currentMonthRevenue[0]?.totalAmount || 0) -
          lastMonthRevenue[0].totalAmount) /
          lastMonthRevenue[0].totalAmount) *
        100
      : null;

    // 5. Doanh thu năm nay (Offline) sau khi trừ chiết khấu
    const currentYearRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startOfYear.getTime() - vietnamTimezoneOffset),
            $lt: new Date(
              today.getTime() + 24 * 60 * 60 * 1000 - vietnamTimezoneOffset
            ),
          },
          purchaseType: "Offline",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $subtract: ["$totalAmount", "$discountAmount"] },
          },
        },
      },
    ]);

    // 6. Doanh thu năm trước (Offline) sau khi trừ chiết khấu
    const lastYearRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startOfLastYear.getTime() - vietnamTimezoneOffset),
            $lt: new Date(
              endOfLastYear.getTime() +
                24 * 60 * 60 * 1000 -
                vietnamTimezoneOffset
            ),
          },
          purchaseType: "Offline",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $subtract: ["$totalAmount", "$discountAmount"] },
          },
        },
      },
    ]);

    const yearlyGrowth = lastYearRevenue[0]?.totalAmount
      ? (((currentYearRevenue[0]?.totalAmount || 0) -
          lastYearRevenue[0].totalAmount) /
          lastYearRevenue[0].totalAmount) *
        100
      : null;

    // 7. Tổng số sản phẩm
    const totalProducts = await Product.countDocuments();

    // 8. Tổng số bill
    const totalBills = await Bill.countDocuments({ purchaseType: "Offline" });

    // 9. Tổng số khách hàng
    const totalCustomers = await Customer.countDocuments();

    res.json({
      todayRevenue: todayRevenue[0]?.totalAmount || 0,
      yesterdayRevenue: yesterdayRevenue[0]?.totalAmount || 0,
      todayGrowth: todayGrowth || 0,
      currentMonthRevenue: currentMonthRevenue[0]?.totalAmount || 0,
      lastMonthRevenue: lastMonthRevenue[0]?.totalAmount || 0,
      monthlyGrowth: monthlyGrowth || 0,
      currentYearRevenue: currentYearRevenue[0]?.totalAmount || 0,
      lastYearRevenue: lastYearRevenue[0]?.totalAmount || 0,
      yearlyGrowth: yearlyGrowth || 0,
      totalProducts,
      totalBills,
      totalCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating statistics", error });
  }
};

const getDailyRevenue = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // Convert startDate và endDate sang Date để sử dụng trong $match
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    // Aggregate data
    const data = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start.getTime() - 7 * 60 * 60 * 1000), // Chuyển UTC+7
            $lte: new Date(end.getTime() - 7 * 60 * 60 * 1000), // Chuyển UTC+7
          },
          purchaseType: "Offline",
          ...(userId && { createBy: new mongoose.Types.ObjectId(userId) }),
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: { $add: ["$createdAt", 7 * 60 * 60 * 1000] } },
            month: { $month: { $add: ["$createdAt", 7 * 60 * 60 * 1000] } },
            year: { $year: { $add: ["$createdAt", 7 * 60 * 60 * 1000] } },
            employee: "$createBy",
          },
          totalAmount: { $sum: "$totalAmount" },
          totalDiscount: { $sum: "$discountAmount" },
        },
      },
      {
        $lookup: {
          from: "employeemanagements",
          localField: "_id.employee",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.day" },
              "/",
              { $toString: "$_id.month" },
              "/",
              { $toString: "$_id.year" },
            ],
          },
          employeeCode: "$employeeDetails.MaNV",
          employeeName: "$employeeDetails.fullName",
          discountAmount: "$totalDiscount",
          totalAmount: "$totalAmount",
          revenueAfterDiscount: {
            $subtract: ["$totalAmount", "$totalDiscount"],
          },
        },
      },
      { $sort: { date: 1, employeeCode: 1 } },
    ]);

    // Định dạng dữ liệu
    const formattedData = data.reduce((acc, curr) => {
      const dateIndex = acc.findIndex((item) => item.date === curr.date);

      const employeeData = {
        date: curr.date,
        employeeCode: curr.employeeCode,
        employeeName: curr.employeeName,
        discountAmount: curr.discountAmount,
        totalAmount: curr.totalAmount,
        revenueAfterDiscount: curr.revenueAfterDiscount,
      };

      if (dateIndex !== -1) {
        acc[dateIndex].employees.push(employeeData);
        acc[dateIndex].discountAmount += curr.discountAmount;
        acc[dateIndex].totalAmount += curr.totalAmount;
        acc[dateIndex].revenueAfterDiscount += curr.revenueAfterDiscount;
      } else {
        acc.push({
          date: curr.date,
          discountAmount: curr.discountAmount,
          totalAmount: curr.totalAmount,
          revenueAfterDiscount: curr.revenueAfterDiscount,
          employees: [employeeData],
        });
      }

      return acc;
    }, []);

    res.json(formattedData);
  } catch (error) {
    console.error("Error in getDailyRevenue:", error);
    res.status(500).json({
      message: "Error retrieving daily revenue data",
      error: error.message || error,
    });
  }
};

const getCustomerStatistics = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    // Check if startDate and endDate are provided
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required." });
    }

    // Define Date objects for start and end, set them to UTC+7 in $match
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    // Define match stage with customerId as ObjectId if provided, adjust createdAt for UTC+7
    const matchStage = {
      createdAt: {
        $gte: new Date(start.getTime() - 7 * 60 * 60 * 1000),
        $lte: new Date(end.getTime() - 7 * 60 * 60 * 1000),
      },
      ...(customerId && { customer: new mongoose.Types.ObjectId(customerId) }),
    };

    const data = await Bill.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: {
            // Convert createdAt to UTC+7 for grouping by day
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $add: ["$createdAt", 7 * 60 * 60 * 1000] },
              },
            },
            customer: "$customer",
            category: "$categoryDetails._id",
          },
          totalAmount: { $sum: "$totalAmount" },
          discountAmount: { $sum: "$discountAmount" },
          totalAfterDiscountAmount: {
            $sum: { $subtract: ["$totalAmount", "$discountAmount"] },
          },
          customerInfo: { $first: "$customerDetails" },
          categoryName: { $first: "$categoryDetails.name" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          customerId: "$customerInfo.CustomerId",
          customerName: "$customerInfo.fullName",
          address: {
            houseNumber: "$customerInfo.addressLines.houseNumber",
            ward: "$customerInfo.addressLines.ward",
            district: "$customerInfo.addressLines.district",
            province: "$customerInfo.addressLines.province",
          },
          category: "$categoryName",
          totalAmount: 1,
          discountAmount: 1,
          totalAfterDiscountAmount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    console.error("Error in getCustomerStatistics:", error);
    res.status(500).json({
      message: "Error retrieving customer statistics",
      error: error.message || error,
    });
  }
};

module.exports = { getDailyRevenue, getStatistics, getCustomerStatistics };
