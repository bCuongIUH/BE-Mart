const crypto = require("crypto");

const vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_Returnurl = "http://localhost:3000/UIManager";
const vnp_TmnCode = "FYJL2QHA";
const vnp_HashSecret = "JOWHMKFHFDUHLQQAVQDIJVDNNTDPJSBE";
const vnp_apiUrl =
  "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

/**
 * Hash tất cả các trường với SHA512
 * @param {Object} fields - Các trường cần hash
 * @returns {string} - Giá trị hash
 */
const hashAllFields = (fields) => {
  const sortedFields = Object.keys(fields).sort();
  const queryStr = sortedFields.map((key) => `${key}=${fields[key]}`).join("&");

  return hmacSHA512(vnp_HashSecret, queryStr);
};

/**
 * Tạo HMAC SHA512 từ dữ liệu và khóa
 * @param {string} key - Khóa bí mật
 * @param {string} data - Dữ liệu cần hash
 * @returns {string} - Giá trị hash
 */
const hmacSHA512 = (key, data) => {
  return crypto
    .createHmac("sha512", Buffer.from(key, "utf-8"))
    .update(data, "utf-8")
    .digest("hex");
};

/**
 * Lấy địa chỉ IP của client
 * @param {Object} req - Request từ client
 * @returns {string} - Địa chỉ IP
 */
const getIpAddress = (req) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1"; // Mặc định là localhost nếu không xác định được
  return ipAddress;
};

/**
 * Tạo chuỗi số ngẫu nhiên với độ dài xác định
 * @param {number} len - Độ dài chuỗi số
 * @returns {string} - Chuỗi số ngẫu nhiên
 */
const getRandomNumber = (len) => {
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Export các hàm và giá trị cấu hình
module.exports = {
  vnp_PayUrl,
  vnp_Returnurl,
  vnp_TmnCode,
  vnp_HashSecret,
  vnp_apiUrl,
  hashAllFields,
  hmacSHA512,
  getIpAddress,
  getRandomNumber,
};
