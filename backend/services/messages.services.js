const { Message } = require("../models/index.models");

const sendMessage = async (data) => {
    return await Message.create({
        senderId: data.senderId,
        roomId: data.roomId,
        text: data.text
    })
}

const getMessages = async (roomId) => {
    return await Message.find({roomId});
}

const deleteMessages = async (roomId) => {
    return await Message.deleteMany({roomId});
}

module.exports = {sendMessage,getMessages,deleteMessages};