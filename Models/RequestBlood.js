const moongoose = require('mongoose');
const schema = moongoose.Schema;

const requestBloodSchema = new schema({
    user_id: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    request_date: {
        type: Date,
        default: Date.now
    },
    blood_type: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required: true
    },
    quantity: {
        type: Number,
        min: [1, 'Quantity must be at least 1 unit'],
        max: [10, 'Quantity cannot exceed 10 units'],
        required: [true, 'Quantity is required'],
    },
    hospital_name: {
        type: String,
        required: true
    },
    hospital_address: {
        type: String,
        required: true
    },
    contact_number: {
        type: String,
        required: true,
        match: [/^[0-9]{8}$/, 'Please enter a valid phone number']
    },
    urgency: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const RequestBlood = moongoose.model('RequestBlood', requestBloodSchema);
module.exports = RequestBlood;