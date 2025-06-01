const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    role: String, // 'user' or 'AI'
    content: String,
});

const screeningSchema = new mongoose.Schema({
    user_id: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [messageSchema],
    result: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Screening", screeningSchema);
