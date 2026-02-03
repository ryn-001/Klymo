const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ['Male', 'Female'] },
    interests: [{ type: String }],
    avatar: { type: String, default: "" },
    deviceId: { type: String, required: true, index: true },
},{timestamps: true});

module.exports = mongoose.model('User', userSchema);