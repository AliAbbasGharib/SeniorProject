const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    role: String, // 'user' or 'AI'
    content: String,
});

const screeningSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [messageSchema],
    result: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DonationBlood", screeningSchema);
