const User = require('../../user/models/User');
const EmployeeManagement = require('../models/employee'); 
const sendEmail = require('../../../src/user/utils/sendEmail'); 
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcrypt');

// Tạo mật khẩu ngẫu nhiên
const generateRandomPassword = () => {
  const length = 10; // Độ dài của mật khẩu
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Tạo mã OTP 6 số ngẫu nhiên
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.addEmployee = async (req, res) => {
    const { fullName, email, phoneNumber, address, gender, dateOfBirth, role } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại' });
      }
  
      const otp = generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000;
  
      // Tạo mật khẩu ngẫu nhiên
      const password = generateRandomPassword(); 
  
      const user = new User({
        email,
        password, 
        fullName,
        phoneNumber,
        otp,
        otpExpires,
        role,
      });
  
   
      await user.save(); 
  
      // Tạo nội dung email
      const otpEmailContent = `Mã OTP của bạn là: ${otp}`;
      const passwordEmailContent = `Mật khẩu của bạn là: ${password}. Vui lòng thay đổi mật khẩu sau khi đăng nhập lần đầu.`;
  
      // Gửi OTP và mật khẩu đến email
      await sendEmail(email, 'Xác minh OTP', otpEmailContent);
      await sendEmail(email, 'Chào mừng bạn trở thành nhân viên của siêu thị CMart.', passwordEmailContent);
  
      // Tạo bản ghi quản lý nhân viên
      const employeeManagement = new EmployeeManagement({
        employeeId: user._id,
        status: 'active',
        joinDate: Date.now(),
        address, 
        gender, 
        dateOfBirth, 
        email,
        fullName,
        phoneNumber,
      });
  
     
      await employeeManagement.save();
  
      return res.status(StatusCodes.CREATED).json({ message: 'Đã gửi OTP và mật khẩu tới email của bạn. Vui lòng xác minh để hoàn tất' });
    } catch (error) {
     
      await User.deleteOne({ email }); 
      console.error("Error during adding employee:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình thêm nhân viên' });
    }
  };
  

// Xác minh OTP cho nhân viên mới
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' });
      }
  
      // Kiểm tra mã OTP và thời gian hết hạn
      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
      }
  
      // Đánh dấu tài khoản là đã xác minh
      user.isVerified = true;
      user.otp = undefined; // Xóa OTP
      user.otpExpires = undefined; // Xóa thời gian hết hạn
      await user.save();
  
      return res.status(StatusCodes.OK).json({ message: 'Xác minh thành công' });
    } catch (error) {
      console.error("Error during OTP verification:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
    }
};

// Lấy tất cả sản phẩm
exports.getAllEmployee = async (req, res) => {
    try {
      const employees = await EmployeeManagement.find({ isDeleted: false });
      
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên', error });
    }
  };
  