const admin = require('firebase-admin');

// Ensure FIREBASE_CREDENTIALS is set
if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error("FIREBASE_CREDENTIALS environment variable is not set.");
}

// Parse the Firebase credentials
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Log client_email for debugging in non-production environments
if (process.env.NODE_ENV !== 'production') {
    console.log("Firebase client_email:", serviceAccount.client_email);
}

module.exports = admin;