const ChatModel = require('../models/chat.models');
const crypto = require('crypto');

const QueueMatchmaking = {
    queue: [],

    addUser: function (socket) {
        const exist = this.queue.find(u => u.id === socket.id);
        if (!exist) this.queue.push(socket);
        this.matchUser();
    },

    deleteUser: function (socketId) {
        // Ensure we filter by the unique socket string ID
        this.queue = this.queue.filter(u => u.id !== socketId);
    },

    matchUser: async function () {
        if (this.queue.length < 2) return;

        let i = 0;
        while (i < this.queue.length) {
            const u1 = this.queue[i];

            let partnerIdx = this.queue.findIndex((u, idx) => {
                if (idx === i || u.deviceId === u1.deviceId) return false;
                const u1Interests = Array.isArray(u1.interests) ? u1.interests : [];
                const uInterests = Array.isArray(u.interests) ? u.interests : [];
                return u1Interests.some(interest => 
                    uInterests.map(s => s.toLowerCase()).includes(interest.toLowerCase())
                );
            });

            if (partnerIdx === -1 && this.queue.length > 1) {
                partnerIdx = this.queue.findIndex((u, idx) => idx !== i && u.deviceId !== u1.deviceId);
            }

            if (partnerIdx !== -1) {
                const user1 = this.queue.splice(i, 1)[0];
                const adjustedIdx = partnerIdx > i ? partnerIdx - 1 : partnerIdx;
                const user2 = this.queue.splice(adjustedIdx, 1)[0];

                const commonInterest = (user1.interests || []).find(interest =>
                    (user2.interests || []).map(s => s.toLowerCase()).includes(interest.toLowerCase())
                ) || "General";

                const seed = `${user1.id}-${user2.id}-${Date.now()}`;
                const roomId = crypto.createHash('sha256').update(seed).digest('hex').substring(0, 24);

                try {
                    await ChatModel.create({
                        roomId: roomId,
                        participants: [
                            { userId: user1.userId, socketId: user1.id, username: user1.username, avatar: user1.avatar },
                            { userId: user2.userId, socketId: user2.id, username: user2.username, avatar: user2.avatar }
                        ],
                        matchReason: commonInterest,
                        status: 'active'
                    });

                    user1.join(roomId);
                    user2.join(roomId);

                    const payload = (p, reason) => ({
                        roomId,
                        partner: {
                            username: p.username,
                            bio: p.bio,
                            gender: p.gender,
                            avatar: p.avatar,
                            deviceId: p.deviceId
                        },
                        notice: `CONNECTED_VIA_${reason.toUpperCase()}`
                    });

                    user1.emit("match_found", payload(user2, commonInterest));
                    user2.emit("match_found", payload(user1, commonInterest));
                    
                    i = 0; 
                    continue;
                } catch (err) {
                    console.error("Match Creation Error:", err);
                    this.queue.push(user1, user2);
                    break;
                }
            }
            i++;
        }
    }
};

module.exports = { QueueMatchmaking };