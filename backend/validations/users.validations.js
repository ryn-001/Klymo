const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).trim().required(),
    bio: Joi.string().max(250).allow('').required(),
    gender: Joi.string().valid('Male', 'Female').required(),
    interests: Joi.array().items(Joi.string().trim()).default([]).required(),
    avatar: Joi.string().allow('').optional(),
    deviceId: Joi.string().required().messages({
        'any.required': 'Device ID is required for security protocols.'
    })
});

module.exports = { userSchema };