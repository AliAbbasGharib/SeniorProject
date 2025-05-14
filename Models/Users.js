const mongoose = require("mongoose");
const schema = mongoose.Schema

const userSchema =  new schema({
    name: String,
    email: String,
    password: String,
    phone_number: String,
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ["Male","Female"],
    },
    blood_type: {
        type: String,
        enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"],
    },
    address: {
        type: String,
        default: "No Address",
    },
    last_donation_date: {
        type: Date,
    },
    role: {
        type: String,
        default: "2001",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    
});

const Users = mongoose.model("User", userSchema);

module.exports = Users;