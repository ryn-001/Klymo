const express = require('express');
const MessageRouter = express.Router();
const {MessageControllers} = require("../controllers/index.controllers");
const {messageSchema} = require("../validations/message.validations");
const {validate} = require('../middlewares/validate.middleware');

MessageRouter.post('/send',validate(messageSchema),MessageControllers.sendMessage);
MessageRouter.get('/',MessageControllers.getRoomMessages);

module.exports = {MessageRouter};