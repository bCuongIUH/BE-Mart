const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');

// Tạo mã OTP 6 số ngẫu nhiên
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    // In ra mật khẩu để kiểm tra
    console.log("Mật khẩu nhập:", password);
    console.log("Mật khẩu mã hóa:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    // In ra kết quả so sánh
    console.log("Kết quả so sánh:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Tài khoản chưa được xác minh' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production' 
    })
    res.cookie('Session_JS', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // tồn tại 1 ngày
    });
    
    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
      message: 'Đăng nhập thành công'
    });
    
  } catch (error) {
    console.error('Lỗi đăng nhập:', error.message);
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

// exports.login = async (req, res) => {
//   const { email, password } = req.body;
 
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Người dùng không tồn tại' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Mật khẩu không chính xác' });
//     }

//     if (!user.isVerified) {
//       return res.status(400).json({ message: 'Tài khoản chưa được xác minh' });
//     }

//     // Tạo accessToken và refreshToken
//     const accessToken = jwt.sign(
//       { id: user._id, role: user.role }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: '15m' }
//     );

//     const refreshToken = jwt.sign(
//       { id: user._id, role: user.role }, 
//       process.env.JWT_REFRESH_SECRET, 
//       { expiresIn: '1d' } 
//     );

//     res.cookie('token', accessToken, { 
//       httpOnly: true, 
//       secure: process.env.NODE_ENV === 'production', 
//       maxAge: 15 * 60 * 1000, // 15 phút
//     });

//     res.cookie('refreshToken', refreshToken, { 
//       httpOnly: true, 
//       secure: process.env.NODE_ENV === 'production', 
//       maxAge: 1 * 24 * 60 * 60 * 1000, //
//     });

//     return res.status(200).json({
//       accessToken,
//       refreshToken,
//       user: {
//         _id: user._id,
//         email: user.email,
//         fullName: user.fullName,
//         role: user.role,
//         phoneNumber: user.phoneNumber,
//       },
//       message: 'Đăng nhập thành công'
//     });

//   } catch (error) {
//     console.error('Lỗi đăng nhập:', error.message);
//     return res.status(500).json({ message: 'Có lỗi xảy ra' });
//   }
// };
// // kiểm tra token
// exports.checkToken = (req, res, next) => {
//   try {
//     const accessToken = req.headers["accesstoken"];
//     const refreshToken = req.headers["refreshtoken"];

//     if (!accessToken && !refreshToken) {
//       return res.status(401).json({ message: 'Không có token' });
//     }

//     // Kiểm tra accessToken
//     jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         // Nếu accessToken hết hạn, kiểm tra refreshToken
//         jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decodedRefresh) => {
//           if (err) {
//             return res.status(403).json({ message: 'Token không hợp lệ' });
//           }

//           // Nếu refreshToken hợp lệ, tạo accessToken mới
//           const newAccessToken = jwt.sign(
//             { id: decodedRefresh.id, role: decodedRefresh.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '15m' }
//           );

//           res.cookie('token', newAccessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             maxAge: 15 * 60 * 1000, // 15 phút
//           });

//           req.user = decodedRefresh;
//           next();
//         });
//       } else {
//         // AccessToken hợp lệ
//         req.user = decoded;
//         next();
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server khi kiểm tra token' });
//   }
// };
// //kiểm tra role
// exports.someProtectedRoute = (req, res) => {
//   // Đảm bảo req.user không undefined
//   if (!req.user) {
//     console.log(req.user);
    
//     return res.status(401).json({ message: "Người dùng chưa xác thực" });
//   }

//   const userRole = req.user.role; // Truy cập role từ req.user
//   // Tiếp tục xử lý yêu cầu dựa trên role
//   if (userRole === 'admin') {
//     return res.status(200).json({ message: "Đây là route dành cho quản trị viên." });
//   }

//   return res.status(403).json({ message: "Bạn không có quyền truy cập." });
// };


//đăng kí

exports.register = async (req, res) => {
  const { email, password, fullName, phoneNumber } = req.body;

  try {
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại' }); 
    }
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    // thông tin chứa
    const user = new User({ email, password, fullName, phoneNumber, otp, otpExpires });
    await user.save();

    // Send OTP to the user's email
    await sendEmail(email, 'Xác minh OTP', `Mã OTP của bạn là: ${otp}`);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Đã gửi OTP tới email của bạn' }); 
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình đăng ký' }); 
  }
};

// Xác minh OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' }); 
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production' 
    })
    return res.status(StatusCodes.OK).json({ token, message: 'Xác minh thành công' }); 
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
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
      console.log(req.cookies);

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
    const otpExpires = Date.now() + 10 * 60 * 1000; // thời gian tồn lại otp 10p

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



exports.changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId); 
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình đổi mật khẩu' });
  }
};
// lấy user trong database
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); 
    res.status(200).json({ users }); 
  } catch (error) {
    console.error('Lỗi khi lấy tất cả người dùng:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy người dùng' });
  }
};
// Cập nhật vai trò của người dùng
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id); 
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    user.role = role; // Cập nhật vai trò
    await user.save(); // Lưu thay đổi

    res.status(200).json({ message: 'Cập nhật vai trò thành công', user });
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật vai trò' });
  }
};

