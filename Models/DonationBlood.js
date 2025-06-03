const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ScreeningSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chatHistory: [
        {
            role: { type: String, enum: ['user', 'assistant'], required: true },
            content: { type: String, required: true }
        }
    ],
    eligible: { type: Boolean },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DonationBlood', DonorSchema);
