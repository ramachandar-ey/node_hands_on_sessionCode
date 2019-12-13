const mongoose= require('mongoose');
const productSchema= new mongoose.Schema({
    name:{type:String,required:true,unique:true},
    price: Number,
    qty:Number
});

module.exports=mongoose.model('product',productSchema);

