const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const OTP = require('../models/OTP')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const Customer = require('../../customer/models/Customer');

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



    const isMatch = await bcrypt.compare(password, user.password);


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




// exports.register = async (req, res) => {
//   const { email, password, fullName, phoneNumber } = req.body;

//   try {
//     // Kiểm tra xem email đã tồn tại trong User hay chưa
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email đã được sử dụng' });
//     }

//     // Kiểm tra xem email đã tồn tại trong OTP chưa
//     const existingOTP = await OTP.findOne({ email });
//     if (existingOTP) {
//       return res.status(400).json({ message: 'Email đã tồn tại trong danh sách chờ xác minh' });
//     }
//  // Kiểm tra xem số điện thoại đã tồn tại trong User hay chưa
//  const existingUserByPhone = await User.findOne({ phoneNumber });
//  if (existingUserByPhone) {
//    return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
//  }
//     // Tạo mã OTP và thời gian hết hạn
//     const otp = generateOTP();
//     const otpExpires = Date.now() + 10 * 60 * 1000; 

//     // Lưu thông tin tạm thời vào OTP
//     const otpRecord = new OTP({
//       email,
//       otp,
//       otpExpires,
//       verified: false,
//       tempData: { email, password, fullName, phoneNumber }
//     });
//     await otpRecord.save();

//     // Gửi OTP qua email
//     await sendEmail(email, 'Xác minh OTP', `Mã OTP của bạn là: ${otp}`);

//     return res.status(201).json({ message: 'Đã gửi OTP tới email của bạn' });
//   } catch (error) {
//     console.error("Error during registration:", error);
//     return res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình đăng ký' });
//   }
// };

// exports.verifyOTP = async (req, res) => {

//   const { email, otp } = req.body;

//   try {
//     const otpRecord = await OTP.findOne({ email, otp });
//     if (!otpRecord) {
//       return res.status(400).json({ message: 'OTP không hợp lệ' });
//     }

//     if (otpRecord.otpExpires < Date.now()) {
//       await OTP.deleteOne({ email, otp });
//       return res.status(400).json({ message: 'OTP đã hết hạn' });
//     }

//     // Kiểm tra nếu người dùng đã tồn tại
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email đã được đăng ký' });
//     }

//     // Xác minh thành công và tạo tài khoản cho người dùng
//     const { tempData } = otpRecord;
//     if (!tempData) {
//       return res.status(400).json({ message: 'Dữ liệu tạm thời không hợp lệ' });
//     }

//     const { email: tempEmail, password, fullName, phoneNumber } = tempData;

//     const user = new User({ email: tempEmail, password, fullName, phoneNumber, isVerified: true });
//     await user.save();

//     const customer = new Customer({
//       CustomerId: user._id,
//       email: tempEmail,
//       fullName,
//       phoneNumber,
//       joinDate: Date.now(),
//       dateOfBirth: null,
//       addressLines: {
//         houseNumber: '',
//         ward: '',
//         district: '',
//         province: ''
//       }
//     });
//     await customer.save();

//     await OTP.deleteOne({ email: tempEmail });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

//     return res.status(200).json({ token, message: 'Xác minh thành công' });
//   } catch (error) {
//     console.error("Lỗi xác minh OTP:", error);
//     return res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
//   }
// };
exports.register = async (req, res) => {
  const { email, password, fullName, phoneNumber } = req.body;

  try {
    // Kiểm tra xem email đã tồn tại trong User hay chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Kiểm tra xem số điện thoại đã tồn tại trong User chưa
    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    // Tìm khách hàng chưa đăng ký theo số điện thoại
    const existingCustomer = await Customer.findOne({ phoneNumber });

    if (existingCustomer && existingCustomer.isRegistered) {
      return res.status(400).json({ message: 'Số điện thoại đã được đăng ký tài khoản' });
    }

    // Tạo mã OTP và thời gian hết hạn
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    // Lưu thông tin tạm thời vào OTP
    const otpRecord = new OTP({
      email,
      otp,
      otpExpires,
      verified: false,
      tempData: { email, password, fullName, phoneNumber }
    });
    await otpRecord.save();

    // Gửi OTP qua email
    await sendEmail(email, 'Xác minh OTP', `Mã OTP của bạn là: ${otp}`);

    return res.status(201).json({ message: 'Đã gửi OTP tới email của bạn' });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình đăng ký' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP không hợp lệ' });
    }

    if (otpRecord.otpExpires < Date.now()) {
      await OTP.deleteOne({ email, otp });
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }

    const { tempData } = otpRecord;
    const { email: tempEmail, password, fullName, phoneNumber } = tempData;

    // Kiểm tra nếu số điện thoại đã tồn tại trong Customer
    const existingCustomer = await Customer.findOne({ phoneNumber });

    let user;

    if (existingCustomer) {
      // Cập nhật thông tin khách hàng
      existingCustomer.email = tempEmail;
      existingCustomer.fullName = fullName;
      existingCustomer.isRegistered = true;
      await existingCustomer.save();

      // Tạo User liên kết với khách hàng
      user = new User({ email: tempEmail, password, fullName, phoneNumber, isVerified: true });
      await user.save();

      // Cập nhật ID của User vào Customer
      existingCustomer.CustomerId = user._id;
      await existingCustomer.save();
    } else {
      // Nếu chưa có bản ghi Customer, tạo mới cả User và Customer
      user = new User({ email: tempEmail, password, fullName, phoneNumber, isVerified: true });
      await user.save();

      const customer = new Customer({
        CustomerId: user._id,
        email: tempEmail,
        fullName,
        phoneNumber,
        joinDate: Date.now(),
        dateOfBirth: null,
        addressLines: {
          houseNumber: '',
          ward: '',
          district: '',
          province: ''
        },
        isRegistered: true,
      });
      await customer.save();
    }

    await OTP.deleteOne({ email: tempEmail });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return res.status(200).json({ token, message: 'Xác minh thành công' });
  } catch (error) {
    console.error("Lỗi xác minh OTP:", error);
    return res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
  }
};

// resendOTP Controller
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Tìm bản ghi OTP dựa trên email
    const existingOtpRecord = await OTP.findOne({ email });
    if (!existingOtpRecord) {
      return res.status(400).json({ message: 'Người dùng chưa yêu cầu mã OTP trước đó' });
    }

    // Cập nhật OTP mới và giữ lại thông tin tạm thời (`tempData`)
    const newOtp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    // Cập nhật mã OTP và thời hạn, giữ nguyên `tempData`
    existingOtpRecord.otp = newOtp;
    existingOtpRecord.otpExpires = otpExpires;

    // Lưu lại bản ghi OTP đã cập nhật
    await existingOtpRecord.save();

    // Gửi email với mã OTP mới
    await sendEmail(email, 'Xác minh OTP', `Mã OTP của bạn là: ${newOtp}`);

    return res.status(200).json({ message: 'Đã gửi lại OTP tới email của bạn' });
  } catch (error) {
    console.error("Lỗi khi gửi lại OTP:", error);
    return res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình gửi lại OTP' });
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

    // Tạo mã OTP và thời gian hết hạn
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    // Lưu OTP và thời gian hết hạn trong model User
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

    // Kiểm tra OTP
    if (user.otp !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không đúng' });
    }

    // Kiểm tra thời gian hết hạn OTP
    if (user.otpExpires < Date.now()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP đã hết hạn' });
    }

    // Tạo token đặt lại mật khẩu nếu OTP hợp lệ
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.status(StatusCodes.OK).json({ resetToken, message: 'OTP xác minh thành công' });
  } catch (error) {
    console.error('Lỗi trong quá trình xác minh OTP:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
  }
};
//cập nhật mật khẩu sau khi otp
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Xác thực token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' });
    }


    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined; 
    await user.save();

    return res.status(StatusCodes.OK).json({ message: 'Mật khẩu của bạn đã được cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi trong quá trình đặt lại mật khẩu:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình đặt lại mật khẩu' });
  }
};

//nhập mật khẩu mới
exports.changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId); 
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });

   
    // Cập nhật mật khẩu mới
    user.password = newPassword;
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

