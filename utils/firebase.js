const admin = require('firebase-admin');

// Ensure the environment variable is set
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
}

// Parse the Firebase service account JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Optional: log the client_email for debugging (in development only)
if (process.env.NODE_ENV !== 'production') {
    console.log("Firebase client_email:", serviceAccount.client_email);
}

module.exports = admin;
