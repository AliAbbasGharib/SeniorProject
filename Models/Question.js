const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    type: { type: String, default: 'yesno' }, // e.g., yesno, multiple-choice, text
    order: { type: Number, default: 0 },
})

module.exports = mongoose.model('Question', questionSchema);
