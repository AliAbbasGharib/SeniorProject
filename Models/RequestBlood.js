const mongoose = require('mongoose');
const schema = mongoose.Schema;

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
    done_status: {
        type: String,
        enum: ["complete", "non complete"],
        default: "non complete",
        required: true
    },
    // Add this location field (GeoJSON Point)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
}, { timestamps: true });

// Create 2dsphere index for geospatial queries
requestBloodSchema.index({ location: '2dsphere' });

const RequestBlood = mongoose.model('RequestBlood', requestBloodSchema);
module.exports = RequestBlood;
