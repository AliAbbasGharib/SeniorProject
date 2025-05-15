const express = require('express');
const router = express.Router();

const AuthController = require('../app/Controller/AuthController');
const UserController = require("../app/Controller/UserController");
const AuthMiddleware = require('../app/Middleware/Authenticate');
const CheckAdmin = require('../app/Middleware/CheckAdmin');
const RequestBloodController = require('../app/Controller/RequestBloodController');

// Public Routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// Authenticated User Route
router.get("/user", AuthMiddleware, UserController.userAuth);

//Admin-Protected Routes Only
router.use('/admin', AuthMiddleware, CheckAdmin); // All routes below /admin will require admin
router.get("/admin/users", UserController.getAllUsers);
router.get("/admin/user/:id", UserController.getSpecificUser);
router.post("/admin/user/add", UserController.addUser);
router.put("/admin/user/update/:id", UserController.updateUser);
router.delete("/admin/user/:id", UserController.deleteUser);

// General Authenticated Routes (non-admin or admin)
router.post("/request/add", AuthMiddleware, RequestBloodController.addRequest);

module.exports = router;
