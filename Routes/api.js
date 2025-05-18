const express = require('express');
const router = express.Router();
const AuthController = require('../app/Controller/AuthController');
const UserController = require("../app/Controller/UserController");
const AuthMiddleware = require('../app/Middleware/Authenticate');
const CheckAdmin = require('../app/Middleware/CheckAdmin');
const RequestBloodController = require('../app/Controller/RequestBloodController');
// public Route
// Auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// Authenticated user route
router.get("/user", AuthMiddleware, UserController.userAuth);
// protected Routes
// Admin-protected Routes
router.get("/users", AuthMiddleware, CheckAdmin, UserController.getAllUsers);
router.get("/user/:id", AuthMiddleware, CheckAdmin, UserController.getSpecificUser);
router.get("/user/limit/:number", AuthMiddleware, CheckAdmin, UserController.getLimitedUsers);
router.post("/user/add", AuthMiddleware, CheckAdmin, UserController.addUser);
router.put("/user/update/:id", AuthMiddleware, CheckAdmin, UserController.updateUser);
router.delete("/user/:id", AuthMiddleware, CheckAdmin, UserController.deleteUser);
router.put("/user/update-status/:id", AuthMiddleware, CheckAdmin, UserController.statusUser);

// User-protected Routes
router.get("/request", RequestBloodController.getAllRequests);
router.get("/request/:id", RequestBloodController.getSpecificRequest);
router.get("/request/limit/:number", RequestBloodController.getLimitedRequests);
router.post("/request/add", AuthMiddleware, RequestBloodController.addRequest);
router.put("/request/update/:id", AuthMiddleware, RequestBloodController.updateRequest);
router.delete("/request/:id", AuthMiddleware, RequestBloodController.deleteRequest);

module.exports = router;
