const mongoose = require('mongoose');

const ChannelChitSchema = new mongoose.Schema({
    userId: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'User' },
    chitNo: { type: String, required: true },
    channelId: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'Channel' },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    price: { type:Number, required: true},
});
module.exports = mongoose.model('ChannelChit', ChannelChitSchema);