const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId:{type:String,required:true},
    email:{type:String,required:true},
    name:{type:String,required:true},
    picture:{type:String,required:true},
    userType:{type:String,required:true},
    verified:{type:Boolean,required:true}
});
module.exports = mongoose.model('User', userSchema);