const express = require("express");
const mongoose = require("mongoose");
const ChatRoom = require("../models/ChatRoom");

const router = express.Router();

/**
 * GET /rooms
 * Fetch all chat rooms with participant counts
 */
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await ChatRoom.find({})
      .select("name description category users createdBy createdAt")
      .sort({ createdAt: -1 });

    const formattedRooms = rooms.map((room) => ({
      ...room.toObject(),
      participants: room.users.length,
      id: room._id,
    }));

    res.status(200).json(formattedRooms);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    res
      .status(500)
      .json({ message: "Error fetching chat rooms", error: error.message });
  }
});

/**
 * POST /rooms
 * Create a new chat room
 */
router.post("/rooms", async (req, res) => {
  try {
    const { name, description, category, username } = req.body;

    if (!name || !username) {
      return res
        .status(400)
        .json({ message: "Room name and username are required" });
    }

    const existingRoom = await ChatRoom.findOne({ name });
    if (existingRoom) {
      return res
        .status(400)
        .json({ message: "Chat room with this name already exists" });
    }

    const newRoom = new ChatRoom({
      name,
      description,
      category,
      createdBy: username,
      users: [{ username }],
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating chat room:", error);
    res
      .status(500)
      .json({ message: "Error creating chat room", error: error.message });
  }
});

/**
 * POST /rooms/:roomId/join
 * Join an existing chat room
 */
router.post("/rooms/:roomId/join", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room ID format" });
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res
        .status(404)
        .json({ message: `Chat room with ID ${roomId} not found` });
    }

    const isUserInRoom = room.users.some(
      (user) => user.username === username
    );

    if (isUserInRoom) {
      const populatedRoom = await ChatRoom.findById(roomId).populate(
        "users",
        "username"
      );
      return res.status(200).json({
        ...populatedRoom.toObject(),
        alreadyInRoom: true,
      });
    }

    await room.addUser(username);

    const populatedRoom = await ChatRoom.findById(roomId).populate(
      "users",
      "username"
    );

    res.status(200).json(populatedRoom);
  } catch (error) {
    console.error("Error joining chat room:", error);
    res.status(500).json({
      message: "Error joining chat room",
      error: error.message,
    });
  }
});

/**
 * GET /rooms/:roomId
 * Get details of a specific chat room
 */
router.get("/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room ID format" });
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    res.json(room);
  } catch (error) {
    console.error("Error fetching chat room:", error);
    res
      .status(500)
      .json({ message: "Error fetching chat room", error: error.message });
  }
});

/**
 * POST /rooms/:roomId/messages
 * Send a message to a chat room
 */
router.post("/rooms/:roomId/messages", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username, message } = req.body;

    if (!username || !message) {
      return res
        .status(400)
        .json({ message: "Username and message are required" });
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    await room.addMessage(username, message);

    const updatedRoom = await ChatRoom.findById(roomId);

    res.status(201).json(updatedRoom.messages);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
});

/**
 * GET /rooms/:roomId/messages
 * Get all messages for a chat room
 */
router.get("/rooms/:roomId/messages", async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room ID format" });
    }

    const room = await ChatRoom.findById(roomId).select("messages");
    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    res.json(room.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
});

module.exports = router;
