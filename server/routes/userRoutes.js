const express = require('express');
const userRoutes = express.Router();

const { singup, login, updateProfile, checkAuth } = require('../controller/UserController');
const { protectRoute } = require('../middleware/auth');

// Routes
userRoutes.post("/signup", singup);
userRoutes.post("/login", login);
userRoutes.put("/update-profile",protectRoute,updateProfile);
userRoutes.get("/check", protectRoute, checkAuth);

module.exports = userRoutes;
