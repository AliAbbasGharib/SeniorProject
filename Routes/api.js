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
router.use(AuthMiddleware, CheckAdmin);
// Admin-protected Routes
router.get("/users", UserController.getAllUsers);
router.get("/user/:id", UserController.getSpecificUser);
router.post("/user/add", UserController.addUser);
router.put("/user/update/:id", UserController.updateUser);
router.delete("/user/:id", UserController.deleteUser);



// Authenticated user
router.use(AuthMiddleware);
// User-protected Routes
router.post("/request/add", RequestBloodController.addRequest);

module.exports = router;
