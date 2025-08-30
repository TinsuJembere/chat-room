require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

// Import routes and models
const chatRoutes = require("./routes/chatRoutes");
const ChatRoom = require("./models/ChatRoom");

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://chat-room-lime.vercel.app"
        : ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://chat-room-lime.vercel.app"
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 New client connected");

  // Join a chat room
  socket.on("join_room", async (roomId, username) => {
    try {
      socket.join(roomId);
      const room = await ChatRoom.findById(roomId);
      if (room) {
        await room.addUser(username);
        io.to(roomId).emit("user_joined", { username, users: room.users });
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  // Handle new messages
  socket.on("send_message", async ({ roomId, username, message }) => {
    try {
      const room = await ChatRoom.findById(roomId);
      if (room) {
        await room.addMessage(username, message);
        io.to(roomId).emit("receive_message", {
          username,
          message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle user typing
  socket.on("typing", ({ roomId, username, isTyping }) => {
    socket.to(roomId).emit("user_typing", { username, isTyping });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// Routes
app.use("/api/chat", chatRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/dist")));

  // ✅ Catch-all route for SPA (works with Express 5)
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Debug helper: list all registered routes
if (process.env.NODE_ENV !== "production") {
  console.log("📌 Registered routes:");
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`${Object.keys(r.route.methods).join(",").toUpperCase()} ${r.route.path}`);
    } else if (r.name === "router") {
      r.handle.stack.forEach((s) => {
        if (s.route && s.route.path) {
          console.log(`${Object.keys(s.route.methods).join(",").toUpperCase()} ${s.route.path}`);
        }
      });
    }
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server };
