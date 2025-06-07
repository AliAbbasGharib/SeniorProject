const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
                required: true,
            },
            answerText: { type: String, required: true },
        }
    ],
    eligible: {
        type: Boolean,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
