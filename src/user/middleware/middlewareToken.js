const jwt = require("jsonwebtoken");
class MiddleWareToken {
  async validateToken(req, res, next) {
    try {
      const accessToken = req.headers["accesstoken"];
      const refreshToken = req.headers["refreshtoken"];
      if (!accessToken || !refreshToken) {
        return res
          .status(401)
          .send("Vui lòng đăng nhập!!!");
      }
      try {
        jwt.verify(accessToken, process.env.SECRETKEY);
        next();
      } catch (error) {
        try {
          jwt.verify(refreshToken, process.env.SECRETKEY);
          next();
        } catch (error) {
          return res
            .status(401)
            .send("Phiên đăng nhập hết hạn!!!!");
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Lỗi hệ thống");
    }
  }
}
module.exports = new MiddleWareToken();