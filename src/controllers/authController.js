const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
// Tạo mã OTP 6 số ngẫu nhiên
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// Đăng nhập người dùng
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Người dùng không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Mật khẩu không chính xác' });

    if (!user.isVerified) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tài khoản chưa được xác minh' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(StatusCodes.OK).json({ token, message: 'Đăng nhập thành công' });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra' });
  }
};
//đăng kí

exports.register = async (req, res) => {
  const { email, password, name, phoneNumber } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại' }); // 400 Bad Request
    }

    // Generate OTP and set expiration time
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires after 10 minutes

    // Create and save the new user
    const user = new User({ email, password, name, phoneNumber, otp, otpExpires });
    await user.save();

    // Send OTP to the user's email
    await sendEmail(email, 'Xác minh OTP', `Mã OTP của bạn là: ${otp}`);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Đã gửi OTP tới email của bạn' }); // 201 Created
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình đăng ký' }); // 500 Internal Server Error
  }
};

// Xác minh OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' }); // Mã 404
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' }); // Mã 400
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(StatusCodes.OK).json({ token, message: 'Xác minh thành công' }); // Mã 200
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' }); // Mã 500
  }
};