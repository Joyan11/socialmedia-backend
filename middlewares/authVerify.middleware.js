const jwt = require("jsonwebtoken");
const mySecret = process.env['TOKEN_KEY'];

const authVerify = (req, res, next) => {
  const token = req.headers.authorization;
  try {
    let decoded = jwt.verify(token, mySecret);
    req.user = {userid:decoded.userid};
    return next();
  } catch (err) {
    console.log("token error")
    res.status(401).json({ message: "token not valid" });
  }
}

module.exports = { authVerify }