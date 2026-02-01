const mongoose = require('mongoose');

const DatabaseConnection = async (server) => {
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully !");

        server.listen(process.env.PORT, () => {
            console.log("Server running on PORT : " + process.env.PORT);
        })
    }catch(err){
        console.log(err);
    }
}

module.exports = {DatabaseConnection};