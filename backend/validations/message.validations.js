const Joi = require('joi');

const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"roomId" must be a valid ObjectId');
    }
    return value;
};

const messageSchema = Joi.object({
    senderId: Joi.string().required().messages({'string.empty': 'Sender ID is required'}),
    roomId: Joi.string().custom(objectId).required().messages({'string.empty': 'Room ID is required'}),
    text: Joi.string().min(1).max(500).required().trim(),
    type: Joi.string().default('text'),
})

module.exports = {messageSchema};