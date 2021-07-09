const { User } = require("../models/users.model");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const { userid } = req.user;
  try {
    const notifications = await User.findById(userid).populate("notification.sourceUser", "name username profilePicture").select("notification");
    res.status(200).json(notifications)
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
})

router.post("/:id/read", async (req, res) => {
  const {id} = req.params;
  const { userid } = req.user;
  try {
    const notification = await User.findOneAndUpdate({ _id: userid, "notification._id": id }, {
      $set: { "notification.$.read": true }
    }, { new: true }).populate("notification.sourceUser", "name username profilePicture").select("notification");
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
})


module.exports = router