const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
            answer: { type: String, required: true }    
        }
    ],
    eligible: {
        type: Boolean,
        required: true,
    }
});

module.exports = mongoose.model('Answer', answerSchema);
