const moongoose = require('mongoose');
const schema = moongoose.Schema;

const requestBloodSchema = new schema({
    user_id: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient_name: {
        type: String,
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
        max: [8, 'Quantity cannot exceed 8 units'],
        required: [true, 'Quantity is required'],
    },
    donation_point: {
        type: String,
        required: true
    },
    contact_number: {
        type: String,
        required: true,
        match: [/^[0-9]{8}$/, 'Please enter a valid phone number']
    },
    description: {
        type: String,
    },
    transportation: {
        type: String,
        enum: ["provided", "not provided"],
        required: true
    },
    urgency: {
        type: String,
        enum: ["Regular", "Urgent"],
        default: "Regular",
        required: true,
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