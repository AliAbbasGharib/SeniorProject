const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

});
console.log("Firebase client_email:", serviceAccount.client_email); // Log the client_email for debugging

module.exports = admin;