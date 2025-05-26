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
    isRead: {
        type: String,
        enum: ["read", "unread"],
        default: "unread"
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Notification", NotificationSchema);
