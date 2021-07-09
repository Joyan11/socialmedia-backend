const mongoose = require("mongoose");
const User = require("./users.model")
const { Schema } = mongoose;

const PostSchema = new Schema({
  userid:{ type: Schema.Types.ObjectId, ref: "User" },
  desc:{
    type:String,
    max:200
  },
  likes:{
    type:Array,
    default:[]
  },
  image:{
    type:String,
    default:""
  },
  comments: [{ userid: { type: Schema.Types.ObjectId, ref: 'User' }, comment: String }]
},{ timestamps: true})

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post };