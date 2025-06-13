const admin = require('firebase-admin');
const serviceAccount = require('../seniorproject-be8ce-firebase-adminsdk-fbsvc-0580e1044f.json'); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  
});
console.log("Firebase client_email:", admin);

module.exports = admin;