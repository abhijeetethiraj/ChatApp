const cloudinary = require("../lib/cloudinary");
const { getIO, userSocketMap } = require("../lib/socketio"); // ✅ Updated import
const Message = require("../models/Message");
const User = require("../models/User");
// Get all users except the logged-in user
const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filterUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessage = {};

    const promises = filterUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessage[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.json({ success: true, users: filterUsers, unseenMessage });
  } catch (error) {
    console.error("Sidebar error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages for selected user
const getmessage = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as seen
const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({ success: true });
  } catch (error) {
    console.error("Mark seen error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];

if (receiverSocketId) {
  const io = getIO(); // ✅ Get io instance
  io.to(receiverSocketId).emit("newMessage", newMessage);
}

    res.json({ success: true, newMessage });
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Export all controllers (CommonJS style)
module.exports = {
  getUserForSidebar,
  getmessage,
  markMessageAsSeen,
  sendMessage,
};
