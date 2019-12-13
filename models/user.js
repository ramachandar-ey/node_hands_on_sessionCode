const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
   name:String,
   role:{type:Number,default:1},
   email:{type:String,required:true,unique:true},//uni
   password:{type:String,required:true}
});

module.exports=mongoose.model('user',userSchema);