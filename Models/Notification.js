const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    user_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", required: true
    },
    title:
    {
        type: String,
        required: true
    },
    body:
    {
        type: String,
        required: true
    },
    type:
    {
        type: String,
        default: "general"
    }, // or 'blood_request', 'alert', etc.
    related_request_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RequestBlood"
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Notification", NotificationSchema);
