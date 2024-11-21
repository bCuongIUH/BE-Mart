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
          status: "HoanThanh",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }, 
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
          status: "HoanThanh",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }, 
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
          status: "HoanThanh",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }, 
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
          status: "HoanThanh",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }, 
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
          status: "HoanThanh",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }, 
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
          status: "HoanThanh",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }, 
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
          status: "HoanThanh",
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
          revenueAfterDiscount:"$totalAmount",
          totalAmount: {
            $sum: ["$totalAmount", "$totalDiscount"],
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

// const getCustomerStatistics = async (req, res) => {

//   try {
//     const { startDate, endDate, customerId } = req.query;

//     if (!startDate || !endDate) {
//       return res
//         .status(400)
//         .json({ message: "startDate and endDate are required." });
//     }

//     const start = new Date(startDate);
//     start.setUTCHours(0, 0, 0, 0);
//     const end = new Date(endDate);
//     end.setUTCHours(23, 59, 59, 999);

//     const matchStage = {
//       createdAt: {
//         $gte: new Date(start.getTime() - 7 * 60 * 60 * 1000),
//         $lte: new Date(end.getTime() - 7 * 60 * 60 * 1000),
//       },
//       status: "HoanThanh",
//       ...(customerId && { customer: new mongoose.Types.ObjectId(customerId) }),
//     };

//     const data = await Bill.aggregate([
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       { $unwind: "$customerDetails" },
//       {
//         $addFields: {
//           // Loại bỏ các sản phẩm khuyến mãi (nếu `isGift` hoặc `price === 0`)
//           filteredItems: {
//             $filter: {
//               input: "$items",
//               as: "item",
//               cond: { $gt: ["$$item.currentPrice", 0] }, // Giữ sản phẩm có giá > 0
//             },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "filteredItems.product",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       { $unwind: "$productDetails" },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "productDetails.category",
//           foreignField: "_id",
//           as: "categoryDetails",
//         },
//       },
//       { $unwind: "$categoryDetails" },
//       {
//         $group: {
//           _id: {
//             date: {
//               $dateToString: {
//                 format: "%Y-%m-%d",
//                 date: { $add: ["$createdAt", 7 * 60 * 60 * 1000] },
//               },
//             },
//             customer: "$customer",
//             category: "$categoryDetails._id",
//           },
          
//           discountAmount: { $sum: "$discountAmount" },
//           totalAfterDiscountAmount: {
//             $sum: {
//               $sum: {
//                 $map: {
//                   input: "$filteredItems",
//                   as: "item",
//                   in: { $multiply: ["$$item.currentPrice", "$$item.quantity"] },
//                 },
//               },
//             },
//           },
//           customerInfo: { $first: "$customerDetails" },
//           categoryName: { $first: "$categoryDetails.name" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id.date",
//           customerId: "$customerInfo.CustomerId",
//           customerName: "$customerInfo.fullName",
//           phoneNumber: "$customerInfo.phoneNumber",
//           address: {
//             houseNumber: "$customerInfo.addressLines.houseNumber",
//             ward: "$customerInfo.addressLines.ward",
//             district: "$customerInfo.addressLines.district",
//             province: "$customerInfo.addressLines.province",
//           },
//           category: "$categoryName",
//           totalAmount: {
//             $add: ["$totalAfterDiscountAmount"],
//           },
//           discountAmount: 1,
//           totalAfterDiscountAmount: {
//             $subtract: ["$totalAfterDiscountAmount", "$discountAmount"], 
//           },
//         },
//       },
//       { $sort: { date: 1, phoneNumber: 1 } },
//     ]);

//     res.json(data);
//   } catch (error) {
//     console.error("Error in getCustomerStatistics:", error);
//     res.status(500).json({
//       message: "Error retrieving customer statistics",
//       error: error.message || error,
//     });
//   }
// };
const getCustomerStatistics = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required." });
    }

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const matchStage = {
      createdAt: {
        $gte: new Date(start.getTime() - 7 * 60 * 60 * 1000),
        $lte: new Date(end.getTime() - 7 * 60 * 60 * 1000),
      },
      status: "HoanThanh",
      ...(customerId && { customer: new mongoose.Types.ObjectId(customerId) }),
    };

    const data = await Bill.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          vietnamTime: { $add: ["$createdAt", 7 * 60 * 60 * 1000] },
          actualTotalAmount: { $add: ["$totalAmount", "$discountAmount"] }
        }
      },
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
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true
        }
      },
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
            billId: "$_id",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$vietnamTime" } },
            customer: "$customer",
            category: "$categoryDetails._id"
          },
          customerInfo: { $first: "$customerDetails" },
          categoryName: { $first: "$categoryDetails.name" },
          actualTotalAmount: { $first: "$actualTotalAmount" },
          totalAmount: { $first: "$totalAmount" },
          discountAmount: { $first: "$discountAmount" },
          itemsTotal: { 
            $sum: { $multiply: ["$items.currentPrice", "$items.quantity"] }
          }
        }
      },
      {
        $group: {
          _id: {
            date: "$_id.date",
            customer: "$_id.customer",
            category: "$_id.category"
          },
          customerInfo: { $first: "$customerInfo" },
          categoryName: { $first: "$categoryName" },
          actualTotalAmount: { $sum: "$actualTotalAmount" },
          totalAmount: { $sum: "$totalAmount" },
          discountAmount: { $sum: "$discountAmount" },
          itemsTotal: { $sum: "$itemsTotal" },
          billCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          customerId: "$customerInfo.CustomerId",
          customerName: "$customerInfo.fullName",
          phoneNumber: "$customerInfo.phoneNumber",
          address: {
            houseNumber: "$customerInfo.addressLines.houseNumber",
            ward: "$customerInfo.addressLines.ward",
            district: "$customerInfo.addressLines.district",
            province: "$customerInfo.addressLines.province",
          },
          category: "$categoryName",
          actualTotalAmount: 1,
          totalAmount: 1,
          discountAmount: 1,
          itemsTotal: 1,
          billCount: 1
        }
      },
      { $sort: { date: 1, phoneNumber: 1, category: 1 } },
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
const getVoucherStatistics = async (req, res) => {
  try {
    const { startDate, endDate, voucherType } = req.query;

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const matchCondition = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    const typeTranslations = {
      BuyXGetY: "Mua hàng Tặng hàng",
      FixedDiscount: "Giảm Giá Cố Định",
      PercentageDiscount: "Giảm Giá Phần Trăm",
    };

    const voucherStatistics = await Bill.aggregate([
      { $match: matchCondition },
      { $unwind: "$appliedVouchers" },
      {
        $match: {
          "appliedVouchers.type": {
            $in: ["FixedDiscount", "PercentageDiscount"],
          },
        },
      },
      {
        $group: {
          _id: "$appliedVouchers.code",
          totalDiscountAmount: { $sum: "$discountAmount" },
          usageCount: { $sum: 1 },
          voucherType: { $first: "$appliedVouchers.type" },
        },
      },
      {
        $lookup: {
          from: "vouchers",
          localField: "_id",
          foreignField: "code",
          as: "voucherDetails",
        },
      },
      { $unwind: "$voucherDetails" },
      {
        $lookup: {
          from: "promotionprograms",
          localField: "voucherDetails.promotionProgram",
          foreignField: "_id",
          as: "promotionProgramDetails",
        },
      },
      { $unwind: "$promotionProgramDetails" },
      {
        $lookup: {
          from: "fixeddiscountvouchers",
          localField: "voucherDetails._id",
          foreignField: "voucherId",
          as: "fixedDiscountConditions",
        },
      },
      {
        $lookup: {
          from: "percentagediscountvouchers",
          localField: "voucherDetails._id",
          foreignField: "voucherId",
          as: "percentageDiscountConditions",
        },
      },
      {
        $addFields: {
          conditions: {
            $cond: {
              if: { $eq: ["$voucherType", "FixedDiscount"] },
              then: "$fixedDiscountConditions",
              else: "$percentageDiscountConditions",
            },
          },
        },
      },
      {
        $addFields: {
          deduplicatedConditions: {
            $reduce: {
              input: "$conditions",
              initialValue: [],
              in: {
                $cond: {
                  if: {
                    $anyElementTrue: {
                      $map: {
                        input: "$$value",
                        as: "existing",
                        in: {
                          $and: [
                            {
                              $eq: [
                                "$$existing.productXId",
                                "$$this.productXId",
                              ],
                            },
                            {
                              $eq: [
                                "$$existing.discountAmount",
                                "$$this.discountAmount",
                              ],
                            },
                            {
                              $eq: [
                                "$$existing.discountPercentage",
                                "$$this.discountPercentage",
                              ],
                            },
                          ],
                        },
                      },
                    },
                  },
                  then: "$$value",
                  else: { $concatArrays: ["$$value", ["$$this"]] },
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          voucherCode: { $first: "$_id" },
          voucherName: { $first: "$voucherDetails.name" },
          usageCount: { $first: "$usageCount" },
          totalDiscountAmount: { $first: "$totalDiscountAmount" },
          voucherType: { $first: "$voucherType" },
          startDate: { $first: "$promotionProgramDetails.startDate" },
          endDate: { $first: "$promotionProgramDetails.endDate" },
          conditions: { $first: "$deduplicatedConditions" },
        },
      },
      { $sort: { usageCount: -1 } },
    ]);

    const translatedVoucherStatistics = voucherStatistics.map((stat) => ({
      ...stat,
      voucherType: typeTranslations[stat.voucherType] || stat.voucherType,
    }));

    let buyXGetYDetails = [];
    if (voucherType === "BuyXGetY" || !voucherType) {
      buyXGetYDetails = await Bill.aggregate([
        { $match: matchCondition },
        { $unwind: "$appliedVouchers" },
        {
          $match: {
            "appliedVouchers.type": "BuyXGetY",
          },
        },
        {
          $lookup: {
            from: "vouchers",
            localField: "appliedVouchers.code",
            foreignField: "code",
            as: "voucherDetails",
          },
        },
        { $unwind: "$voucherDetails" },
        {
          $lookup: {
            from: "promotionprograms",
            localField: "voucherDetails.promotionProgram",
            foreignField: "_id",
            as: "promotionProgramDetails",
          },
        },
        { $unwind: "$promotionProgramDetails" },
        {
          $lookup: {
            from: "buyxgetyvouchers",
            localField: "voucherDetails._id",
            foreignField: "voucherId",
            as: "buyXGetYConditions",
          },
        },
        { $unwind: "$buyXGetYConditions" },
        {
          $unwind: {
            path: "$buyXGetYConditions.conditions",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "buyXGetYConditions.conditions.productXId",
            foreignField: "_id",
            as: "productXDetails",
          },
        },
        {
          $unwind: {
            path: "$productXDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $unwind: "$giftItems" },
        {
          $lookup: {
            from: "products",
            localField: "giftItems.product",
            foreignField: "_id",
            as: "productYDetails",
          },
        },
        {
          $unwind: {
            path: "$productYDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$voucherDetails.code",
            voucherCode: { $first: "$voucherDetails.code" },
            voucherName: { $first: "Mua hàng tặng hàng" },
            startDate: { $first: "$promotionProgramDetails.startDate" },
            endDate: { $first: "$promotionProgramDetails.endDate" },
            productYId: { $first: "$productYDetails.code" },
            productYName: { $first: "$productYDetails.name" },
            quantityY: { $sum: "$giftItems.quantity" },
            quantityY1: { $first: "$giftItems.quantity" },
            unitY: { $first: "$giftItems.unit" },
            conditions: {
              $addToSet: {
                productXId: "$buyXGetYConditions.conditions.productXId",
                quantityX: "$buyXGetYConditions.conditions.quantityX",
                unitX: "$buyXGetYConditions.conditions.unitX",
                productXName: "$productXDetails.name",
              },
            },
          },
        },
      ]);
    }

    res.json({
      voucherStatistics: translatedVoucherStatistics,
      buyXGetYDetails,
    });
  } catch (error) {
    console.error("Error in getVoucherStatistics:", error);
    res.status(500).json({
      message: "Error retrieving voucher statistics",
      error: error.message || error,
    });
  }
};

module.exports = { getDailyRevenue, getStatistics, getCustomerStatistics, getVoucherStatistics };
