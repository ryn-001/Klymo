const {Chat} = require("../services/index.services");

const createChat = async (participant1,participant2,roomId) => {
    return await Chat.create({
        roomId,
        participants: [
            {
                socketId: participant1.socketId,
                nickname: participant1.nickname
            },
            {
                socketId: participant2.socketId,
                nickname: participant2.nickname
            },
        ]
    })
}

const updateChat = async (roomId,newStatus) => {
    return await Chat.findOneAndUpdate({roomId},{status:newStatus});
}

const getChat = async (roomId) => {
    return await Chat.findOne({roomId});
}

const deleteChat = async (roomId) => {
    return await Chat.findOneAndDelete({ roomId });
}

module.exports = {createChat,updateChat,getChat,deleteChat}