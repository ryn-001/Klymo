const express = require('express');
const router = express.Router();
const {ChatRouter} = require("./chats.routes");
const {MessageRouter} = require("./messages.routes");

router.use('/messages',MessageRouter);
router.use('/chats',ChatRouter);

module.exports = {router};