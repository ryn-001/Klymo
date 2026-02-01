const {MessageServices} = require("../services/index.services");

const sendMessage = async (req,res) => {
    try{
        const {senderId,roomId,text} = req.body;

        if(!senderId) return res.status(400).josn({success: false, message: "Sender Id required"});
        if(!roomId) return res.status(400).josn({success: false, message: "Room Id required"});
        if(!text) return res.status(400).josn({success: false, message: "Text required"});

        await MessageServices.sendMessage(req.body);
        return res.status(201).josn({success: true});
    }catch(err){
        return res.status(500).josn(err);
    }
}

const getRoomMessages = async (req,res) => {
    try{
        const {roomId} = req.body;

        if(!roomId) return res.status(400).josn({success: false, message: "Room Id required"});

        const messages = await MessageServices.getMessages(roomId);
        return res.status(200).josn({success: true, messages});
    }catch(err){
        return res.status(500).josn(err);
    }
}

const deleteMessages = async (req,res) => {
    try{
        const {roomId} = req.body;

        if(!roomId) return res.status(400).josn({success: false, message: "Room Id required"});

        await MessageServices.deleteMessages(roomId);
        return res.status(204).josn({success: true});
    }catch(err){
        return res.status(500).josn(err);
    }
}

module.exports = {sendMessage,getRoomMessages,deleteMessages};