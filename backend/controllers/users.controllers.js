const { UserServices, DeviceServices } = require("../services/index.services");
const cloudinary = require('cloudinary').v2;

const addUser = async (req, res) => {
    try {
        const { username, bio, gender, interests, avatarUrl, deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ success: false, message: 'Device ID is required' });
        }

        const deviceStatus = await DeviceServices.findDevice(deviceId);
        if (deviceStatus) {
            if (deviceStatus.isPermanentBan) {
                return res.status(403).json({ success: false, message: 'Device is permanently banned' });
            }
            if (deviceStatus.banUntil && new Date() < deviceStatus.banUntil) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Banned until ${new Date(deviceStatus.banUntil).toLocaleString()}` 
                });
            }
        }

        const userData = { username, bio, gender, interests, deviceId };

        if (avatarUrl) {
            const uploadRes = await cloudinary.uploader.upload(avatarUrl, {
                folder: "aegis_avatars",
                overwrite: true,
                resource_type: "auto"
            });
            userData.avatar = uploadRes.secure_url;
        }

        const savedUser = await UserServices.addUser(userData);
        return res.status(201).json({ success: true, data: savedUser });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id, _id } = req.body;
        const userId = id || _id;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        await cloudinary.uploader.destroy(`aegis_avatars/avatar_${userId}`).catch(() => {});

        await UserServices.deleteUser(userId);

        return res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = { addUser, deleteUser };