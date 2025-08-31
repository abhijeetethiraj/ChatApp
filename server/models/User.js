// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  profile: { type: String, default: "" } // <-- store Cloudinary URL here
});

module.exports = mongoose.model("User", userSchema);
