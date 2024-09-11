const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); 
const authRoutes = require('./src/routes/authRoutes');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Địa chỉ frontend của bạn
  credentials: true // Để cho phép cookie và thông tin xác thực khác
}));
app.use(express.json());

// Định tuyến cho xác thực
app.use('/api/auth', authRoutes);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối MongoDB thành công'))
  .catch((err) => console.log('Lỗi kết nối MongoDB', err));

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});