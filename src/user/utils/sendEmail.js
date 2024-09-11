const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Sử dụng dịch vụ Gmail
  auth: {
    user: process.env.EMAIL_USER, // Địa chỉ email của bạn
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng hoặc mật khẩu email
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Địa chỉ email gửi
    to, // Địa chỉ email nhận
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
