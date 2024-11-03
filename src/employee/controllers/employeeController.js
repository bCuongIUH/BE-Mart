
const User = require('../../user/models/User');
const EmployeeManagement = require('../models/employee'); 
const sendEmail = require('../../../src/user/utils/sendEmail'); 
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcrypt');
const OTPVerification = require('../models/OTPVerification');

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
const timeZoneOffset = 7 * 60 * 60 * 1000;
// Tạo mã OTP 6 số ngẫu nhiên
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
//theem nv
exports.addEmployee = async (req, res) => {
  const { MaNV, fullName, email, phoneNumber, gender, dateOfBirth, role, addressLines } = req.body;

  try {
      // Kiểm tra xem email đã tồn tại trong bảng User chưa
      const existingUser = await User.findOne({ email });
      const existingEmployee = await EmployeeManagement.findOne({ MaNV });
      if (existingUser) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại và không thể đăng ký lại.' });
      }
      if (existingEmployee) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Mã nhân viên đã tồn tại trong hệ thống.' });
    }
     const existingOTP = await OTPVerification.findOne({ email });
     if (existingOTP) {
         return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP đã được gửi, vui lòng kiểm tra email của bạn.' });
     }

      // Xóa bất kỳ OTP nào có cùng email nếu tồn tại, đảm bảo không bị trùng lặp
      await OTPVerification.deleteOne({ email });

      const otp = generateOTP();
      const otpExpiresUTC = new Date(Date.now() + 10 * 60 * 1000); 

      const otpRecord = new OTPVerification({
          MaNV,
          email,
          fullName,
          phoneNumber,
          gender,
          dateOfBirth,
          role,
          addressLines,
          otp,
          otpExpires: otpExpiresUTC,
      });

      await otpRecord.save();

      const otpEmailContent = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;
      await sendEmail(email, 'Xác minh OTP', otpEmailContent);

      return res.status(StatusCodes.CREATED).json({ message: 'Đã gửi OTP tới email của bạn. Vui lòng xác minh để hoàn tất' });
  } catch (error) {
      console.error("Error during adding employee:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình gửi OTP' });
  }
};


exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
      const otpRecord = await OTPVerification.findOne({ email });
      if (!otpRecord) {
          return res.status(StatusCodes.NOT_FOUND).json({ message: 'Yêu cầu xác minh OTP không tồn tại' });
      }

      // Kiểm tra mã OTP và thời gian hết hạn
      if (otpRecord.otp !== otp) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không hợp lệ' });
      }

      if (otpRecord.otpExpires <= new Date()) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP đã hết hạn' });
      }

      // Tạo mật khẩu ngẫu nhiên cho tài khoản
      const password = generateRandomPassword();

      // Kiểm tra lại một lần nữa trong bảng User
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại trong hệ thống' });
      }

      // Tạo tài khoản User sau khi OTP được xác minh
      const user = new User({
          email: otpRecord.email,
          password,
          fullName: otpRecord.fullName,
          phoneNumber: otpRecord.phoneNumber,
          role: otpRecord.role || 'admin', 
          isVerified: true,
      });
      await user.save();

      // Lưu thông tin vào EmployeeManagement sau khi tài khoản User đã được tạo
      const employeeManagement = new EmployeeManagement({
          employeeId: user._id,
          MaNV: otpRecord.MaNV,
          status: 'active',
          joinDate: Date.now(),
          addressLines: otpRecord.addressLines, 
          gender: otpRecord.gender,
          dateOfBirth: otpRecord.dateOfBirth,
          email: otpRecord.email,
          fullName: otpRecord.fullName,
          phoneNumber: otpRecord.phoneNumber,
      });

      await employeeManagement.save();

      // Gửi email chứa mật khẩu cho nhân viên
      const passwordEmailContent = `Mật khẩu của bạn là: ${password}. Vui lòng thay đổi mật khẩu sau khi đăng nhập lần đầu.`;
      await sendEmail(email, 'Chào mừng bạn trở thành nhân viên của công ty.', passwordEmailContent);

      // Xóa bản ghi OTP sau khi hoàn tất
      await OTPVerification.deleteOne({ email });

      return res.status(StatusCodes.OK).json({ message: 'Xác minh thành công và tài khoản đã được tạo' });
  } catch (error) {
      console.error("Error during OTP verification:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
  }
};


// Lấy tất cả nhân viên
exports.getAllEmployee = async (req, res) => {
    try {
      const employees = await EmployeeManagement.find({ isDeleted: false });
      
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên', error });
    }
  };
  
  exports.getEmployeeById = async (req, res) => {
    try {
      const employee = await EmployeeManagement.findOne({
        employeeId: req.params.id, 
        isDeleted: false
      }).populate('employeeId'); // sử dụng populate để tham chiếu đầy đủ từ User
  
      if (!employee) {
        return res.status(404).json({ message: 'Nhân viên không tồn tại' });
      }
  
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy thông tin nhân viên', error });
    }
  };

  // Sửa thông tin nhân viên
  exports.updateEmployee = async (req, res) => {
    try {
      const { id } = req.params; 
      const updateData = req.body;
  
      // Nếu addressLines có trong updateData, cập nhật từng trường
      if (updateData.addressLines) {
        updateData['addressLines.houseNumber'] = updateData.addressLines.houseNumber;
        updateData['addressLines.ward'] = updateData.addressLines.ward;
        updateData['addressLines.district'] = updateData.addressLines.district;
        updateData['addressLines.province'] = updateData.addressLines.province;
        delete updateData.addressLines; // Xóa addressLines gốc để tránh xung đột
      }
  
      const updatedEmployee = await EmployeeManagement.findByIdAndUpdate(
        id,
        updateData,
        { new: true } 
      );
  
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Nhân viên không tồn tại' });
      }
  
      res.json({ message: 'Sửa nhân viên thành công', data: updatedEmployee });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
  };
  

// Xóa nhân viên (cập nhật trường isDeleted là true)
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm nhân viên cần xóa bằng ID
    const deletedEmployee = await EmployeeManagement.findById(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    // Lưu email hiện tại vào trường oldEmail và xóa email
    deletedEmployee.oldEmail = deletedEmployee.email;
    deletedEmployee.email = '';
    deletedEmployee.isDeleted = true; 
    await deletedEmployee.save();

    // Cập nhật bảng User: Xóa email và đặt isVerified thành false
    await User.findOneAndUpdate(
      { _id: deletedEmployee.employeeId },
      { email: '', isVerified: false }, // Giải phóng email và ngăn tự động kích hoạt
      { new: true }
    );

    res.json({ message: 'Xóa nhân viên và lưu lịch sử email thành công', data: deletedEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
  }
};
