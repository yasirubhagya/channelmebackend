const mongoose = require('mongoose');

const ChannelCenterSchema = new mongoose.Schema({
    regNo: { type: String, required: true },
    name: { type: String, required: true },
    owner:{ type: String, required: true },
    address:{ type: String, required: true },
    phoneNo:{ type: String, required: true },
    userId:{ type: mongoose.SchemaTypes.ObjectId, required:true, ref: 'User' },
    doctorsId:[{type:mongoose.SchemaTypes.ObjectId,ref:'Doctor'}]
});
module.exports = mongoose.model('ChannelCenter', ChannelCenterSchema);