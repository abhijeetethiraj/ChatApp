const express = require('express')
const { protectRoute } = require('../middleware/auth')
const { getUserForSidebar, getmessage, markMessageAsSeen, sendMessage } = require('../controller/Messagecontroller')

const messagesRoutes = express.Router()

// Routes
messagesRoutes.get("/users", protectRoute, getUserForSidebar)
messagesRoutes.get("/:id", protectRoute, getmessage)
messagesRoutes.put("/mark/:id", protectRoute, markMessageAsSeen)
messagesRoutes.post("/send/:id",protectRoute,sendMessage)

module.exports = messagesRoutes
