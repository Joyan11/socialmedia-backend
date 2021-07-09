const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { checkExistingUser } = require("../middlewares/checkExistingUser.middleware");
const mySecret = process.env['TOKEN_KEY'];
const { User } = require("../models/users.model");

router.route("/signup")
  .post(checkExistingUser,async (req, res) => {
    try {
      const user = req.userdata;
      const newUser = new User(user);
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);
      newUser.save().then((doc) => res.status(201).json({ success: true, message: "User created successfully" }));
    } catch (error) {
      res.status(500).json({ success: false, message: "Unable to Create New User", errorMessage: error.message })
    }
  })

const getUsername = async (req, res, next) => {
  try {
    const { userCredential, password } = req.body;
    console.log(userCredential)
    let userData="";
    if(userCredential.includes("@")){
      userData = await User.findOne({ email: userCredential});
    }else{
      userData = await User.findOne({ username: userCredential });
    }
    if (userData) {
      const validPassword = await bcrypt.compare(password, userData.password);
      if (validPassword) {
        req.user = userData;
        return next();
      }
    }
    res.status(404).json({ message: "Username or password incorrect" });

  } catch (error) {
    console.log(error)
  }
}


router.route("/login")
  .post(getUsername, (req, res) => {
    const { _id,name, username, profilePicture } = req.user;
    const token = jwt.sign({
      userid: _id
    }, mySecret, { expiresIn: '7d' });
    res.status(200).json({ success: true, token: token, userdata: { userid: _id,name, username,profilePicture }, message: "User authenticated successfully" })
  })


module.exports = router;