const {ChatServices} = require("../services/index.services")

const createChat = async (req,res) => {
    try{
        const {roomId,participants} = req.body;

        if(!roomId) return res.status(400).json({success: false, message: "Room Id required"});
        if(!participants) return res.status(400).json({success: false, message: "Participants required"});

        await ChatServices.createChat(participants[0],participants[1],roomId);
        return res.status(201).json({success: true});
    }catch(err){
        return res.status(500).json({success: false, err});
    }
}

const getChat = async (req,res) => {
    try{
        const {roomId} = req.body;
        if(!roomId) return res.status(400).json({success: false, message: "Room Id required"});
        const chat = await ChatServices.getChat(roomId);
        return res.status(200).josn({success: true, chat});
    }catch(err){
        return res.status(500).json({success: false, err});
    }
}

const deleteChat = async (req,res) => {
    try{
        const {roomId} = req.body;
        if(!roomId) return res.status(400).json({success: false, message: "Room Id required"});
        await ChatServices.deleteChat(roomId);
        return res.status(200).josn({success: true});
    }catch(err){
        return res.status(500).json({success: false, err});
    }
}

module.exports = {createChat,getChat,deleteChat};