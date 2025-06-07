const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['yesno'], // or other types if applicable
        required: true,
    },
    order: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Question', questionSchema);
