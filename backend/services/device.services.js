const {Device} = require("../models/index.models");

const calculateBan = (count) => {
    if (count >= 20) return { isPermanentBan: true, banUntil: null };
    if (count >= 10) return { isPermanentBan: false, banUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    if (count >= 5) return { isPermanentBan: false, banUntil: new Date(Date.now() + 12 * 60 * 60 * 1000) };
    if (count >= 3) return { isPermanentBan: false, banUntil: new Date(Date.now() + 6 * 60 * 60 * 1000) };
    return { isPermanentBan: false, banUntil: null };
};

const findDevice = async (deviceId) => {
    return await Device.findOne({deviceId});
}

const updateReports = async (deviceId) => {
    const device = await Device.findOneAndUpdate(
        { deviceId },
        { $inc: { reportCount: 1 } },
        { new: true, upsert: true }
    );

    const banInfo = calculateBan(device.reportCount);

    if (banInfo.isPermanentBan || banInfo.banUntil) {
        return await Device.findOneAndUpdate(
            { deviceId },
            { $set: banInfo },
            { new: true }
        );
    }

    return device;
}

module.exports = {updateReports,findDevice};