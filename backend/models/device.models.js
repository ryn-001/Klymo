const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: { type: String, unique: true, required: true },
    reportCount: { type: Number, default: 0 },
    banUntil: { type: Date, default: null },
    isPermanentBan: { type: Boolean, default: false }
})

module.exports = mongoose.model('Device',deviceSchema);