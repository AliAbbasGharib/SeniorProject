const express = require('express');
const router = express.Router();
const AuthController = require('../app/Controller/AuthController');
const UserController = require("../app/Controller/UserController");
const AuthMiddleware = require('../app/Middleware/Authenticate');
const RateLimiter = require('../app/Middleware/RateLimiter');
const CheckAdmin = require('../app/Middleware/CheckAdmin');
const CheckAdminOrHospital = require('../app/Middleware/CheckAdminOrHospital');
const AuthRequestBlood = require('../app/Middleware/AuthRequestBlood');
const RequestBloodController = require('../app/Controller/RequestBloodController');
const NotificationController = require('../app/Controller/NotificationController');
const DonationController = require("../app/Controller/DonationController");
const ContactContoller = require("../app/Controller/ContactController");
const { healthQuestions, checkEligibility } = require('../app/Controller/DonationController');
// public Route
// Auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// Authenticated user route
router.get("/user", AuthMiddleware, UserController.userAuth);
// protected Routes
// Admin-protected Routes
// Users
router.get("/users", AuthMiddleware, CheckAdminOrHospital, UserController.getAllUsers);
router.get("/user/:id", AuthMiddleware, CheckAdminOrHospital, UserController.getSpecificUser);
router.get("/users/limit/:number", AuthMiddleware, CheckAdminOrHospital, UserController.getLimitedUsers);
router.post("/user/add", AuthMiddleware, CheckAdminOrHospital, UserController.addUser);
router.put("/user/update/:id", AuthMiddleware, CheckAdminOrHospital, UserController.updateUser);
router.delete("/user/:id", AuthMiddleware, CheckAdminOrHospital, UserController.deleteUser);
router.put("/user/status/:id", AuthMiddleware, CheckAdminOrHospital, UserController.statusUser);
router.put("/user/change-password/:id", AuthMiddleware, UserController.ChangePassword);
router.get("/available-donor", AuthMiddleware, UserController.getAvailableDonors);
router.get('/count-by-blood-type', AuthMiddleware, UserController.countAllBloodTypes);
router.put("/user/update-profile", AuthMiddleware, UserController.updateOwnProfile);
// User-protected Routes

// Request Blood 
router.get("/request", RequestBloodController.getAllRequests);
router.get("/request/my-activity", AuthMiddleware, RequestBloodController.getMyActivityRequests);
router.get("/request/matchingRequest", AuthMiddleware, RequestBloodController.getMatchingRequests);
router.get("/request/:id", RequestBloodController.getSpecificRequest);
router.get("/request/limit/:number", RequestBloodController.getLimitedRequests);
router.post("/request/add", AuthMiddleware, RequestBloodController.addRequest);
router.put("/request/update/:id", AuthMiddleware, AuthRequestBlood, RequestBloodController.updateRequest);
router.delete("/request/:id", AuthMiddleware, AuthRequestBlood, RequestBloodController.deleteRequest);
router.put("/request/status/:id", AuthMiddleware, AuthRequestBlood, RequestBloodController.updateDoneStatus);

// Notification
router.post("/notifications/send-to-all", AuthMiddleware, CheckAdminOrHospital, NotificationController.sendNotificationToAllUsers);
router.get("/notifications", AuthMiddleware, NotificationController.getMyNotifications);
router.get("/notification/:id", AuthMiddleware, NotificationController.getSpecificNotification);
router.delete("/notification/:id", AuthMiddleware, NotificationController.deleteNotifications);
router.put("/notification/update/:id", AuthMiddleware, NotificationController.updateNotifications);
router.get("/unread-count", AuthMiddleware, NotificationController.getUnreadCount);
router.post("/mark-read", AuthMiddleware, NotificationController.markAllAsRead);
router.get("/undelivered", AuthMiddleware, NotificationController.getUndeliveredNotifications);
router.put('/delivered-all', AuthMiddleware, NotificationController.markAllAsDelivered);

// Contact US 
router.post("/send-contact", RateLimiter, ContactContoller.submitContact);
router.get('/messages', AuthMiddleware, CheckAdminOrHospital, ContactContoller.getMessage);
router.delete('/messages/:id', AuthMiddleware, CheckAdminOrHospital, ContactContoller.deleteMessage);
router.put('/messages/:id/status', AuthMiddleware, CheckAdminOrHospital, ContactContoller.updateMessageStatus);


let sessions = {}; 

router.post('/start', (req, res) => {
    const sessionId = Date.now().toString();
    sessions[sessionId] = { currentQuestion: 0, answers: [] };

    res.json({
        sessionId,
        question: healthQuestions[0],
    });
});

router.post('/answer', async (req, res) => {
    const { sessionId, answer } = req.body;
    const session = sessions[sessionId];

    if (!session) {
        return res.status(400).json({ error: 'Invalid session ID' });
    }

    session.answers.push(answer);
    session.currentQuestion++;

    if (session.currentQuestion < healthQuestions.length) {
        res.json({
            question: healthQuestions[session.currentQuestion],
        });
    } else {
        const result = await checkEligibility(session.answers);
        delete sessions[sessionId];
        res.json({ result });
    }
});


module.exports = router;
