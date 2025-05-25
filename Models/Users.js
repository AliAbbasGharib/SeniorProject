const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: String,
    phone_number: {
        type: String,
        match: [/^[0-9]{8}$/, 'Please enter a valid phone number'],
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female"],
    },
    blood_type: {
        type: String,
        required: true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: {
        type: String,
    },
    last_donation_date: {
        type: Date,
    },
    role: {
        type: String,
        default: "2001",
    },

    status: {
        type: String,
        enum: ["active", "inactive", "pending", "banned"],
        default: "active",
    },

    created_at: {
        type: Date,
        default: Date.now,
    },
    donation_availability: {
        type: String,
        enum: ["available", "unavailable"],
        default: 'available',
    },

    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        }
    },
});

// Create 2dsphere index for geospatial queries
userSchema.index({ location: '2dsphere' });

const Users = mongoose.model("User", userSchema);

module.exports = Users;
