const Joi = require('joi');

const chatSchema = Joi.object({
    roomId: Joi.string().required(),
    participants: Joi.array().items(
            Joi.object({
                socketId: Joi.string().required(),
                deviceId: Joi.string().required(),
                nickname: Joi.string().min(2).max(15).required()
            })
        ).length(2).required(),
    status: Joi.string().valid('active', 'ended').default('active')
});

module.exports = {chatSchema}