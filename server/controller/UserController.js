// controller/UserController.js
const bcrypt = require('bcryptjs');
const cloudinary = require("../lib/cloudinary");   // ✅ require instead of import
const { generateToken } = require("../lib/utils"); // ✅ require utils
const User = require("../models/User");            // ✅ require User model

//   signup a new user
const singup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "Account already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);

        res.json({
            success: true,
            userData: newUser,
            token,
            message: "Account created successfully"
        });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userData = await User.findOne({ email });
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);

        res.json({
            success: true,
            userData,
            token,
            message: "Login successfully"
        });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// check authentication
const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};

// update profile
const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updateUser;

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateUser = await User.findByIdAndUpdate(
        userId,
        { profile: upload.secure_url, bio, fullName }, // Change profilePic to profile
        { new: true }
      );
    } else {
      updateUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    }

    res.json({ success: true, user: updateUser });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};


// ✅ Export all controllers (CommonJS style)
module.exports = {
    singup,
    login,
    checkAuth,
    updateProfile
};
