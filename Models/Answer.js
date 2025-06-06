const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    user_id: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: {        // map of questionId -> answer string
        type: Map,
        of: String,
        required: true,
    },
    eligible: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Answer', answerSchema);
