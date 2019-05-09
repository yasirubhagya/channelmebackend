const mongoose =require('mongoose');

const doctorSchema = new mongoose.Schema({
   name:{type:String,required:true},
   slmcNo:{type:String,required:true},
   isConsultant:{type:Boolean,required:true},
   fieldOfConsultingId:{type:mongoose.SchemaTypes.ObjectId,required:false,ref:'ConsultantType'},
   createdById:{type:mongoose.SchemaTypes.ObjectId,required:false,ref:'ChannelCenter'}
});
module.exports = mongoose.model('Doctor',doctorSchema);