const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./lib/db");
const http = require("http");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const messagesRoutes = require("./routes/MessageRoutes");
const { initSocket } = require("./lib/socketio");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize socket only if not on Vercel (since Vercel doesn’t support WebSockets natively)
if (process.env.NODE_ENV !== "production") {
  initSocket(server);
}

connectDB();

app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.get("/api/status", (req, res) => res.send("✅ Server is live"));
app.use("/api/auth", userRoutes);
app.use("/api/messages", messagesRoutes);

const PORT = process.env.PORT || 5000;

// Local development
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}

// 👉 Export the app (not server) for Vercel
module.exports = app;
