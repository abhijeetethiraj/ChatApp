const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protectRoute = async (req, res, next) => {
  try {
    // Extract token (commonly sent in "Authorization" header as "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // get actual token

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (excluding password)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { protectRoute };