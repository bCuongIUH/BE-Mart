const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const authRoutes = require('./src/user/routes/authRoutes');
const productRoutes = require('./src/products/routes/productRoutes'); 
const supplierRouter = require('./src/supplier/routes/supplierRouter');
const warehouseRouter = require('./src/warehouse/routes/warehouseRouter');
const cartRouter = require('./src/cart/routes/cartRouter');

// Khởi tạo ứng dụng Express

dotenv.config();
const app = express();

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Địa chỉ frontend 
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use('/api/suppliers', supplierRouter);
app.use('/api/warehouses', warehouseRouter);
app.use('/api/cart',cartRouter )
// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối MongoDB thành công'))
  .catch((err) => console.log('Lỗi kết nối MongoDB:', err));

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
