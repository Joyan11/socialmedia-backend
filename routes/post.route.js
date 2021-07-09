const { Post } = require("../models/posts.model");
const { User } = require("../models/users.model")
const express = require("express")
const router = express.Router();

//create a post
router.post("/", async (req, res) => {
  const receivedPost = req.body;
  const { userid } = req.user;
  try {
    const NewPost = new Post({ userid: userid, ...receivedPost });
    const newPost = await NewPost.save();
    newPost.populate('userid', 'name username profilePicture').execPopulate();
    const mypost = await newPost.save();
    mypost.__v = undefined;
    mypost.updatedAt = undefined;
    res.status(201).json(mypost);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
})

// get all posts by followers
router.get("/feed", async (req, res) => {
  const { userid } = req.user;
  try {
    const post = await Post.find({ userid: userid }).populate("userid", "name username profilePicture");
    const currentUser = await User.findById(userid);
    const followingPost = await Promise.all(
      currentUser.following.map(followingid => {
        return Post.find({ userid: followingid }).populate("userid", "name username profilePicture")
      })
    );
    post.__v = undefined;
    post.updatedAt = undefined;
    allposts = post.concat(...followingPost)
    res.status(200).json(allposts);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//get all posts of user
router.get("/:userid/allposts", async (req, res) => {
  const { userid } = req.params;
  try {
    const post = await Post.find({ userid: userid }).populate("userid", "name username profilePicture");
    res.status(200).json(post);
    post.__v = undefined;
    post.updatedAt = undefined;
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
})

//get all liked posts
router.get("/:userid/likedposts", async (req, res) => {
  const { userid } = req.params;
  try {
    const likedposts = await Post.find({ likes: { $all: [userid] } }).populate("userid", "name username profilePicture");
    likedposts.__v = undefined;
    likedposts.updatedAt = undefined;
    res.status(200).json(likedposts);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
})


//get a post
router.get("/:postid", async (req, res) => {
  const { postid } = req.params;
  try {
    const post = await Post.findById(postid).populate("userid", "name username profilePicture").populate("comments.userid", "name username profilePicture");
    post.__v = undefined;
    post.updatedAt = undefined;
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//delete a post
router.delete("/:postid", async (req, res) => {
  const { postid } = req.params;
  try {
    const post = await Post.findByIdAndRemove(postid);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//like a post
router.post("/:postid/like", async (req, res) => {
  const { postid } = req.params;
  const { userid } = req.user;
  try {
    const post = await Post.findByIdAndUpdate(postid, {
      $addToSet: { likes: userid }
    }, { new: true }).populate("userid", "name username profilePicture")
    if (post && post.userid._id.toString() !== userid) {
      await User.findByIdAndUpdate(post.userid, {
        $push: {
          notification: {
            notifytype: "LIKE",
            sourceUser: userid,
            post: post._id,
            date: new Date().toISOString()
          }
        }
      });
    }
    post.__v = undefined;
    post.updatedAt = undefined;
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//like single post
router.post("/:postid/likeone", async (req, res) => {
  const { postid } = req.params;
  const { userid } = req.user;
  try {
    const post = await Post.findByIdAndUpdate(postid, {
      $addToSet: { likes: userid }
    }, { new: true }).populate("userid", "name username profilePicture").populate("comments.userid", "name username profilePicture");

    if (post && post.userid._id.toString() !== userid) {
      await User.findByIdAndUpdate(post.userid, {
        $push: {
          notification: {
            notifytype: "LIKE",
            sourceUser: userid,
            post: post._id,
            date: new Date().toISOString()
          }
        }
      });
    }
    post.__v = undefined;
    post.updatedAt = undefined;
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//unlike a post
router.post("/:postid/unlikeone", async (req, res) => {
  const { postid } = req.params;
  const { userid } = req.user;
  try {
    const post = await Post.findByIdAndUpdate(postid, { $pull: { likes: userid } }, { new: true }).populate("userid", "name username profilePicture").populate("comments.userid", "name username profilePicture");

    if (post && post.userid._id.toString() !== userid) {
      await User.findByIdAndUpdate(post.userid, { $pull: { notification: { sourceUser: userid, post: post._id } } });
    }
    post.__v = undefined;
    post.updatedAt = undefined;
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//unlike a post
router.post("/:postid/unlike", async (req, res) => {
  const { postid } = req.params;
  const { userid } = req.user;
  try {
    const post = await Post.findByIdAndUpdate(postid, { $pull: { likes: userid } }, { new: true }).populate("userid", "name username profilePicture");
    if (post && post.userid._id.toString() !== userid) {
      await User.findByIdAndUpdate(post.userid, { $pull: { notification: { sourceUser: userid, post: post._id } } });
    }
    post.__v = undefined;
    post.updatedAt = undefined;
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//comment on a post
router.post("/:postid/comment", async (req, res) => {
  const { postid } = req.params;
  const { comment } = req.body;
  const { userid } = req.user;
  try {
    const post = await Post.findByIdAndUpdate(postid, {
      $push: { comments: { userid: userid, comment: comment } }
    }, { new: true }).populate("userid", "name username profilePicture").populate("comments.userid", "name username profilePicture");
    if (post && post.userid._id.toString() !== userid) {
      await User.findByIdAndUpdate(post.userid._id, {
        $push: {
          notification: {
            notifytype: "COMMENT",
            sourceUser: userid,
            post: post._id,
            date: new Date().toISOString()
          }
        }
      });
    }
    post.__v = undefined;
    post.updatedAt = undefined;
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});

//delete a comment
router.delete("/:postid/comment/:commentid", async (req, res) => {
  const { postid, commentid } = req.params;
  try {
    const post = await Post.findByIdAndUpdate(postid, {
      $pull: { comments: { _id: commentid } }
    }, { new: true }).populate("userid", "name username profilePicture").populate("comments.userid", "name username profilePicture");
    if (post && post.userid._id.toString() !== userid) {
      await User.findByIdAndUpdate(post.userid, { $pull: { notification: { sourceUser: userid, post: post._id } } });
    }
    post.__v = undefined;
    post.updatedAt = undefined;
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err: err.message });
  }
});



module.exports = router