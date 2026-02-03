const { DeviceServices } = require("../services/index.services");

const incrementReports = async (req, res) => {
    try {
        const { deviceId } = req.body;
        if (!deviceId) return res.status(400).json({ success: false, message: 'deviceId is required' });
        
        const updatedDevice = await DeviceServices.updateReports(deviceId);

        return res.status(200).json({ 
            success: true, 
            message: 'User Reported successfully',
            isBanned: !!(updatedDevice.isPermanentBan || updatedDevice.banUntil)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Internal Server Error', err });
    }
};

module.exports = { incrementReports };