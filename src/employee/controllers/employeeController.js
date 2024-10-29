const { format } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

// Múi giờ Việt Nam
const timeZone = 'Asia/Ho_Chi_Minh';

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
exports.addEmployee = async (req, res) => {
  const { MaNV, fullName, email, phoneNumber, gender, dateOfBirth, role, addressLines } = req.body;

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại' });
      }

      const otp = generateOTP();
      const otpExpiresUTC = new Date(Date.now() + 10 * 60 * 1000); // 10 phút từ thời điểm hiện tại theo UTC

      // Chuyển sang giờ địa phương Việt Nam bằng cách cộng 7 giờ
      const otpExpiresLocal = new Date(otpExpiresUTC.getTime() + timeZoneOffset);
      const otpExpiresFormatted = format(otpExpiresLocal, 'yyyy-MM-dd HH:mm:ss');

      // Lưu vào DB theo UTC
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

      // Nội dung email với thời gian hết hạn theo giờ Việt Nam
      const otpEmailContent = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn vào: ${otpExpiresFormatted} (giờ địa phương).`;
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

      // Kiểm tra mã OTP và thời gian hết hạn theo UTC
      if (otpRecord.otp !== otp) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không hợp lệ' });
      }

      if (otpRecord.otpExpires <= new Date()) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP đã hết hạn' });
      }

      // Tạo mật khẩu ngẫu nhiên
      const password = generateRandomPassword();
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo tài khoản User cho nhân viên
      let user = await User.findOne({ email });
      if (!user) {
          user = new User({
              email: otpRecord.email,
              password,
              fullName: otpRecord.fullName,
              phoneNumber: otpRecord.phoneNumber,
              role: otpRecord.role || 'admin', 
              isVerified: true,
          });
          await user.save();
      } else {
          // Nếu tài khoản đã tồn tại, cập nhật trạng thái isVerified thành true
          user.isVerified = true;
          await user.save();
      }

      // Địa chỉ đầy đủ từ các trường địa chỉ
      const address = `${otpRecord.addressLines.houseNumber}, ${otpRecord.addressLines.ward}, ${otpRecord.addressLines.district}, ${otpRecord.addressLines.province}`;

      // Lưu dữ liệu vào EmployeeManagement
      const employeeManagement = new EmployeeManagement({
          employeeId: user._id,
          MaNV: otpRecord.MaNV,
          status: 'active',
          joinDate: Date.now(),
          address,
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

// exports.addEmployee = async (req, res) => {

//   const { fullName, email, phoneNumber, gender, dateOfBirth, role, addressLines } = req.body;

//   try {
//       // Kiểm tra xem email có tồn tại hay không
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//           return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email đã tồn tại' });
//       }

//       // Tạo mã OTP và mật khẩu ngẫu nhiên
//       const otp = generateOTP();
//       const otpExpires = Date.now() + 10 * 60 * 1000;
//       const password = generateRandomPassword();

//       // Địa chỉ kết hợp từ số nhà, xã, huyện, tỉnh
//       const address = `${addressLines.houseNumber}, ${addressLines.ward}, ${addressLines.district}, ${addressLines.province}`;

//       // Tạo người dùng mới
//       const user = new User({
//           email,
//           password,
//           fullName,
//           phoneNumber,
//           otp,
//           otpExpires,
//           role: role || 'admin', 
//       });

//       await user.save();

//       // Tạo bản ghi quản lý nhân viên
//       const employeeManagement = new EmployeeManagement({
//           employeeId: user._id,
//           status: 'active',
//           joinDate: Date.now(),
//           address, // Địa chỉ kết hợp từ các dòng
//           gender,
//           dateOfBirth,
//           email,
//           fullName,
//           phoneNumber,
//       });

//       await employeeManagement.save();

//       // Gửi email với OTP và mật khẩu
//       const otpEmailContent = `Mã OTP của bạn là: ${otp}`;
//       const passwordEmailContent = `Mật khẩu của bạn là: ${password}. Vui lòng thay đổi mật khẩu sau khi đăng nhập lần đầu.`;
//       await sendEmail(email, 'Xác minh OTP', otpEmailContent);
//       await sendEmail(email, 'Chào mừng bạn trở thành nhân viên của siêu thị CMart.', passwordEmailContent);

//       return res.status(StatusCodes.CREATED).json({ message: 'Đã gửi OTP và mật khẩu tới email của bạn. Vui lòng xác minh để hoàn tất' });
//   } catch (error) {
//       await User.deleteOne({ email });
//       console.error("Error during adding employee:", error);
//       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình thêm nhân viên' });
//   }
// };

// // Xác minh OTP cho nhân viên mới
// exports.verifyOTP = async (req, res) => {
//     const { email, otp } = req.body;
  
//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại' });
//       }
  
//       // Kiểm tra mã OTP và thời gian hết hạn
//       if (user.otp !== otp || user.otpExpires < Date.now()) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
//       }
  
//       // Đánh dấu tài khoản là đã xác minh
//       user.isVerified = true;
//       user.otp = undefined; // Xóa OTP
//       user.otpExpires = undefined; // Xóa thời gian hết hạn
//       await user.save();
  
//       return res.status(StatusCodes.OK).json({ message: 'Xác minh thành công' });
//     } catch (error) {
//       console.error("Error during OTP verification:", error);
//       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Có lỗi xảy ra trong quá trình xác minh OTP' });
//     }
// };

// Lấy tất cả sản phẩm
exports.getAllEmployee = async (req, res) => {
    try {
      const employees = await EmployeeManagement.find({ isDeleted: false });
      
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên', error });
    }
  };
  