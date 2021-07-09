const { User } = require("../models/users.model");

const checkExistingUser = async (req, res, next) => {
  const user = req.body;
  try {
    const emailCheck = User.findOne({ email: user.email });
    const usernameCheck = User.findOne({ username: user.username });
    const [emailExist,usernameExist] = await Promise.all([emailCheck,usernameCheck]);
    if (emailExist || usernameExist) {
      res.status(409).json({ success: false, message: "User already exist" })
      return ;
    } else {
      req.userdata = user;
      return next();
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {checkExistingUser}