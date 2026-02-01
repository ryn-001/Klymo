const express = require('express');
const ChatRouter = express.Router();
const {ChatControllers} = require("../controllers/index.controllers");
const {chatSchema} = require("../validations/message.validations");
const {validate} = require('../middlewares/validate.middleware');

ChatRouter.post('/create',validate(chatSchema),ChatControllers.createChat);
ChatRouter.get('/',validate(chatSchema),ChatControllers.getChat);
ChatRouter.delete('/',validate(chatSchema),ChatControllers.deleteChat);

module.exports = {ChatRouter};