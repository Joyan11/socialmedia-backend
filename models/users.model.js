const mongoose = require("mongoose");
const {Post} = require("./posts.model")
const {Schema} = mongoose;

const UserSchema = new Schema({
  name:{
    type:String,
    required:[true,"Name is required"],
    min:[3,"min 3 letters required"],
    max:20,
    index:true
  },
  username:{
    type:String,
    required:[true,"username is required"],
    min:[3,"min 3 letters required"],
    unique:true,
    index:true
  },
  email:{
    type:String,
    required:[true,"email is required"],
    unique:true,
  },
  password:{
    type:String,
    required:[true,"password required"],
    min:[8,"atleast 8 charecters needed"],
  },
  location:{
    type:String,
    default:""
  },
 url:{
    type:String,
    default:""
  },
  profilePicture:{
    type:String,
    default:""
  },
  picturePublicId:{
    type:String,
    default:""
  },
  bio:{
    type:String,
    max:200,
    default:""
  },
  followers:{
    type:Array,
    default:[]
  },
  following:{
    type:Array,
    default:[]
  },
  notification:[{
    notifytype:{
      type:String,
      enum:["FOLLOW","COMMENT","LIKE"],
    },
    read:{type:Boolean,default:false},
    sourceUser:String,
    post:String,
    date:Date,
  }]
},{ timestamps: true})

const User = mongoose.model("User", UserSchema);

module.exports = { User };