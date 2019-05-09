const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
    doctorId:{ type: mongoose.SchemaTypes.ObjectId, required:true, ref: 'Doctor' },
    channelCenterId:{ type: mongoose.SchemaTypes.ObjectId, required:true, ref: 'channelCenter' },
    timeFrom: { type: Date, required: true },
    timeTo:{ type: Date},
    chitLimit:{ type: Number, required: true },
    doctorFees:{ type: Number},
    channelFees:{ type:Number },
    tax:{ type:Number },
    status:{type:String,required:true},
    channelChitId:[{type:mongoose.SchemaTypes.ObjectId,ref:'ChannelChit'}]
});
module.exports = mongoose.model('Channel', ChannelSchema);