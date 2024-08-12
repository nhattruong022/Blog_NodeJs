const mongoose=require('mongoose');

const schema=mongoose.Schema;
const postSchema=new schema({
  title:{
    type:String,
    required:true
  },
  body:{
    type:String,
    required:true
  },
  views:{
    type:Number,
    default:0
  },
  likes:{
    type:Number,
    default:0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
  updatedAt:{
    type:Date,
    default:Date.now
  }
});

module.exports=mongoose.model("posts",postSchema);