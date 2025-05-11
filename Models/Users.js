const mongoose = require("mongoose");
const schema = mongoose.Schema

const userSchema =  new schema({
    name: String,
    email: String,
    password: String,
    phone_number: String,
    role: {
        type: String,
        default: "2001",
    }
});

const Users = mongoose.model("User", userSchema);

module.exports = Users;