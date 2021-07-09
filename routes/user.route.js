const { User } = require("../models/users.model");
const express = require("express")
const router = express.Router();

//update user
router.post("/update", (async (req, res) => {
  const { userid } = req.user;
  const userdetails = req.body;
  try {
    const user = await User.findByIdAndUpdate(userid, { $set: userdetails }, { new: true }).select("name username location url bio profilePicture followers following ");
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, cannot update details" })
  }
}))


//delete user
router.delete("/", async (req, res) => {
  const { userid } = req.user;
  try {
    const user = await User.findByIdAndRemove(userid);
    res.status(200).json({ message: "User successfully deleted" })
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, cannot delete user", err })
  }
})

//get user
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  console.log(username)
  try {
    const user = await User.findOne({ username: username }).select("name username location url bio profilePicture followers following ");
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, cannot delete user", error: err.message })
  }
});

//search a user
router.get("/", async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.find({ $or: [{ name: { $regex: username, $options:"$i" } }, { username: { $regex: username, $options:"$i"} }] }).select("name username profilePicture");
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, cannot get user", err: err.message })
  }
})

//follow a user
router.post("/follow", async (req, res) => {
  const { userid } = req.user;
  const { targetid } = req.body;
  try {
    const currentUser = await User.findByIdAndUpdate(userid, { $addToSet: { following: targetid } }, { new: true });
    const targetUser = await User.findByIdAndUpdate(targetid, {
      $addToSet: {
        followers: userid
      }, $push: {
        notification: {
          notifytype: "FOLLOW",
          sourceUser: userid,
          date: new Date().toISOString()
        }
      }
    }, { new: true }).select("followers");
    res.status(201).json(targetUser)
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, cannot follow user", err: err.message })
  }
});

//unfollow a user
router.post("/unfollow", async (req, res) => {
  const { userid } = req.user;
  const { targetid } = req.body;
  try {
    const currentUser = await User.findByIdAndUpdate(userid, { $pull: { following: targetid } }, { new: true });
    const targetUser = await User.findByIdAndUpdate(targetid, {
      $pull: {
        followers: userid,
        notification: {
          notifytype: "FOLLOW",
          sourceUser: userid
        },
      }
    }, { new: true }).select("followers");
    console.log(targetUser)
    res.status(201).json(targetUser)
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, cannot follow user", err: err.message })
  }
});

//get followers
router.get("/:username/followers", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username }).select("followers");
    const followers = await Promise.all(
      user.followers.map(userid => {
        return User.findById(userid).select("name username profilePicture")
      })
    );
    if (followers) {
      res.status(200).json(followers)
    } else {
      res.status(400).json({ message: "No followers" })
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, followers cannot be fetched", error: err.message })
  }
});

//get following
router.get("/:username/following", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username }).select("following");
    const following = await Promise.all(
      user.following.map(userid => {
        return User.findById(userid).select("name username profilePicture")
      })
    );
    if (following) {
      res.status(200).json(following)
    } else {
      res.status(400).json({ message: "No followers" })
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, followers cannot be fetched", error: err.message })
  }
});

module.exports = router;
