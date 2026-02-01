const QueueMatchmaking = {
    queue : [],

    addUser: function(user){
        const exist = this.queue.find(u => u.id === user.id)
        if(!exist) this.queue.push(user);
    },

    deleteUser : function(user){
        const idx = this.queue.find(u => u.id === user.id);
        if(idx) this.queue.splice(idx,1);
    },

    matchUser : function(){

    }
}

module.exports = {QueueMatchmaking};