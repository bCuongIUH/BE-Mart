const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');

// Tạo mã OTP 6 số ngẫu nhiên
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Người dùng không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không chính xác' });

    if (!user.isVerified) return res.status(400).json({ message: 'Tài khoản chưa được xác minh' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Trả về thông tin người dùng cùng với token
    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,  
        phoneNumber: user.phoneNumber
      },
      message: 'Đăng nhập thành công'
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

//đăng kí

exports.register = async (req, res) => {
  const { email, password, fullName, phoneNumber } = req.body;

  try {
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại' }); // 400 Bad Request
    }
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    // Create and save the new user
    const user = new User({ email, password, fullName, phoneNumber, otp, otpExpires });
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

// Remove Cookie
exports.removeCookie = (req, res) => {
  try {
    if (req.cookies.Session_JS) {
      res.clearCookie('Session_JS');
      res.status(StatusCodes.OK).send('Cookie removed');
    } else {
      res.status(StatusCodes.NOT_FOUND).send('Cookie not found');
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('An error occurred');
  }
};

// Remove Token
exports.removeToken = (req, res) => {
  try {
    if (req.cookies.token) {
      res.clearCookie('token');
      res.status(StatusCodes.OK).send('Token removed');
    } else {
      res.status(StatusCodes.NOT_FOUND).send('Token not found');
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('An error occurred');
  }
};

// Get Token Status
exports.getToken = (req, res) => {
  try {
    if (req.cookies.token) {
      res.status(StatusCodes.OK).send('Token exists');
    } else {
      res.status(StatusCodes.NOT_FOUND).send('Token not found');
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('An error occurred');
  }
};
// mât khẩu
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires after 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Gửi OTP đến email người dùng
    await sendEmail(email, 'Xác minh OTP', `Mã OTP của bạn là: ${otp}`);

    return res.status(StatusCodes.OK).json({ message: 'Đã gửi OTP tới email của bạn' });
  } catch (error) {
    console.error('Lỗi trong quá trình quên mật khẩu:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình quên mật khẩu' });
  }
};

// Xác minh OTP để đặt lại mật khẩu
exports.verifyForgotPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
    }

    // Tạo một token để đặt lại mật khẩu
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.status(StatusCodes.OK).json({ resetToken, message: 'OTP xác minh thành công' });
  } catch (error) {
    console.error('Lỗi trong quá trình xác minh OTP:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
  }
};

// dổi mật khẩu
exports.changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // Kiểm tra xem userId có được cung cấp không
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Thiếu userId trong yêu cầu' });
    }

    // Tìm người dùng theo ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Mật khẩu cũ không chính xác' });
    }

    // Cập nhật mật khẩu mới
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Mật khẩu đã được thay đổi thành công' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra' });
  }
};