const mongoose = require('mongoose');

const ChannelChitSchema = new mongoose.Schema({
    userId: { type: mongoose.SchemaTypes.ObjectId,ref: 'User' },
    name: { type: String},
    nicNo: { type: String},
    email: { type: String},
    phoneNo:{type:String},
    chitNo: { type: Number, required: true },
    channelId: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'Channel' },
    age: { type: Number},
    gender: { type: String},
    
});
module.exports = mongoose.model('ChannelChit', ChannelChitSchema);