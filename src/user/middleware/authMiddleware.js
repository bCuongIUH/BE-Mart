// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ message: 'Token không hợp lệ' });

//     req.user = decoded;
//     next();
//   });
// };

// module.exports = authMiddleware;
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: "Unauthorized" });
      }

      req.userId = decoded.id;

      // Kiểm tra xem người dùng có tồn tại không
      const user = await User.findById(req.userId);
      if (!user) {
          return res.status(401).json({ message: "User not found" });
      }

      next();
  });
};
module.exports = authMiddleware;
