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

exports.isAuthenticated = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Không có token, bạn chưa đăng nhập!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ!' });
        }

        req.user = decoded; 
        next(); 
    });
};


exports.isAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Truy cập bị từ chối' });
    }
    next();
};



