const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
    user_id: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responses: [
        {
            question: String,
            answer: String,
        }
    ],
    eligible: Boolean,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DonationBlood', DonorSchema);
