const { Server } = require("socket.io");

let io;
const userSocketMap = {}; // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== "undefined") {
      // Remove any existing socket for this user
      const existingSocketId = userSocketMap[userId];
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.disconnect();
        }
      }
      
      // Add new socket
      userSocketMap[userId] = socket.id;
      
    }

    // Emit updated online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      if (userId && userId !== "undefined") {
        delete userSocketMap[userId];
      
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO, userSocketMap };