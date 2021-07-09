const { cloudinary } = require('../cloudinary');
const upload = require("../multer");
const express = require("express")
const router = express.Router();

router.post('/upload', upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    res.status(201).json({url:result.url,publicid:result.public_id});
  } catch (err) {
    console.log(err);
  }
});

router.delete("/delete/:public_id", async (req, res) => {
  try {
    // Delete image from cloudinary
    const {public_id} = req.params;
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router