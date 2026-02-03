const User = require("../models/users.models");

const addUser = async (user) => {
    return await User.create({ ...user });
}

const deleteUser = async (userId) => {
    return await User.findByIdAndDelete({userId});
}

module.exports = {addUser,deleteUser};
