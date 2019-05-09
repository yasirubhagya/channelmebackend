const mongoose =require('mongoose');

const ConsultantTypeSchema = new mongoose.Schema({
   name:{type:String,required:true},
   createdById:{type:mongoose.SchemaTypes.ObjectId,required:true,ref:'ChannelCenter'}
});
module.exports = mongoose.model('ConsultantType',ConsultantTypeSchema);