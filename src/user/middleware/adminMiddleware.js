const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware để kiểm tra xem user có vai trò là admin hay không
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    // Tìm user dựa trên ID trong token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra nếu role là admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Xác thực thất bại' });
  }
};

module.exports = adminMiddleware;
