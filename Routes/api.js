const express = require('express');
const router = express.Router();
const AuthController = require('../app/Controller/AuthController');
const UserController = require("../app/Controller/UserController");
const AuthMiddleware = require('../app/Middleware/Authenticate');
const CheckAdmin = require('../app/Middleware/CheckAdmin');
const CheckAdninOrHospital = require("../app/Middleware/CheckAdminOrHospital");
const AuthRequestBlood = require('../app/Middleware/AuthRequestBlood');
const RequestBloodController = require('../app/Controller/RequestBloodController');
const NotificationController = require('../app/Controller/NotificationController');
const CheckAdminOrHospital = require('../app/Middleware/CheckAdminOrHospital');

// public Route
// Auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// Authenticated user route
router.get("/user", AuthMiddleware, UserController.userAuth);
// protected Routes
// Admin-protected Routes
router.get("/users", AuthMiddleware, CheckAdninOrHospital, UserController.getAllUsers);
router.get("/user/:id", AuthMiddleware, CheckAdminOrHospital, UserController.getSpecificUser);
router.get("/user/limit/:number", AuthMiddleware, CheckAdmin, UserController.getLimitedUsers);
router.post("/user/add", AuthMiddleware, CheckAdminOrHospital, UserController.addUser);
router.put("/user/update/:id", AuthMiddleware,CheckAdminOrHospital, UserController.updateUser);
router.delete("/user/:id", AuthMiddleware, CheckAdminOrHospital, UserController.deleteUser);
router.put("/user/status/:id", AuthMiddleware, CheckAdminOrHospital, UserController.statusUser);
router.put("/user/change-password/:id", AuthMiddleware, UserController.ChangePassword);
router.get("/available-donor", AuthMiddleware, UserController.getAvailableDonors);
router.get('/count-by-blood-type', AuthMiddleware, UserController.countAllBloodTypes);
router.put("/user/update-profile", AuthMiddleware, UserController.updateOwnProfile);
// User-protected Routes
router.get("/request", RequestBloodController.getAllRequests);
router.get("/request/:id", RequestBloodController.getSpecificRequest);
router.get("/request/limit/:number", RequestBloodController.getLimitedRequests);
router.post("/request/add", AuthMiddleware, RequestBloodController.addRequest);
router.put("/request/update/:id", AuthMiddleware, AuthRequestBlood, RequestBloodController.updateRequest);
router.delete("/request/:id", AuthMiddleware, AuthRequestBlood, RequestBloodController.deleteRequest);
router.put("/request/status/:id", AuthMiddleware, AuthRequestBlood, RequestBloodController.updateDoneStatus);


router.post("/notifications/send-to-all", AuthMiddleware, CheckAdminOrHospital, NotificationController.sendNotificationToAllUsers);
module.exports = router;
