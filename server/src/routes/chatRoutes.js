const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ChatRoom = require('../models/ChatRoom');

// Get all chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await ChatRoom.find({})
      .select('name description category users createdBy createdAt')
      .sort({ createdAt: -1 });
    
    // Format the response to include participant count
    const formattedRooms = rooms.map(room => ({
      ...room.toObject(),
      participants: room.users.length,
      id: room._id
    }));
    
    res.status(200).json(formattedRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ message: 'Error fetching chat rooms', error: error.message });
  }
});

// Create a new chat room
router.post('/rooms', async (req, res) => {
  try {
    const { name, description, category, username } = req.body;
    
    // Check if room already exists
    const existingRoom = await ChatRoom.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Chat room with this name already exists' });
    }

    // Create new chat room
    const newRoom = new ChatRoom({
      name,
      description,
      category,
      createdBy: username,
      users: [{ username }]
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: 'Error creating chat room', error: error.message });
  }
});

// Join an existing chat room
router.post('/rooms/:roomId/join', async (req, res) => {
  try {
    console.log('Join room request received:', {
      params: req.params,
      body: req.body,
      headers: req.headers
    });

    const { roomId } = req.params;
    const { username } = req.body;

    console.log('Validating request...');

    if (!username || !username.trim()) {
      console.error('Validation failed: Username is required');
      return res.status(400).json({ message: 'Username is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      console.error('Validation failed: Invalid room ID format', { roomId });
      return res.status(400).json({ message: 'Invalid room ID format' });
    }

    console.log('Looking up room...', { roomId });
    const room = await ChatRoom.findById(roomId);
    
    if (!room) {
      console.error('Room not found:', { roomId });
      return res.status(404).json({ message: `Chat room with ID ${roomId} not found` });
    }

    // Check if user is already in the room
    const isUserInRoom = room.users.some(user => user.username === username);
    
    if (isUserInRoom) {
      console.log('User already in room, returning existing room data', { roomId, username });
      // Return 200 with existing room data
      const populatedRoom = await ChatRoom.findById(roomId).populate('users', 'username');
      return res.status(200).json({
        ...populatedRoom.toObject(),
        alreadyInRoom: true
      });
    }

    console.log('Adding user to room...', { roomId, username });
    // Add user to the room if not already a member
    await room.addUser(username);
    
    console.log('Fetching updated room data...');
    // Populate the updated room data before sending
    const populatedRoom = await ChatRoom.findById(roomId).populate('users', 'username');
    
    console.log('Room joined successfully:', { roomId, username });
    res.status(200).json(populatedRoom);
  } catch (error) {
    console.error('Error joining chat room:', {
      error: error.message,
      stack: error.stack,
      request: {
        params: req.params,
        body: req.body,
        url: req.originalUrl,
        method: req.method
      }
    });
    
    res.status(500).json({ 
      message: 'Error joining chat room', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await ChatRoom.find({}).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ message: 'Error fetching chat rooms', error: error.message });
  }
});

// Get a specific chat room
router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ message: 'Error fetching chat room', error: error.message });
  }
});

// Send a message to a chat room
router.post('/rooms/:roomId/messages', async (req, res) => {
  console.log('Received message request:', {
    roomId: req.params.roomId,
    body: req.body,
    headers: req.headers
  });

  try {
    const { roomId } = req.params;
    const { username, message } = req.body;

    if (!username || !message) {
      console.error('Missing required fields:', { username, message });
      return res.status(400).json({ message: 'Username and message are required' });
    }

    console.log('Looking up room:', roomId);
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      console.error('Room not found:', roomId);
      return res.status(404).json({ message: 'Chat room not found' });
    }

    console.log('Adding message to room:', { roomId, username, message });
    // Add the message to the room
    await room.addMessage(username, message);
    
    // Get the updated room with the new message
    const updatedRoom = await ChatRoom.findById(roomId);
    console.log('Message added successfully');
    
    res.status(201).json(updatedRoom.messages);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get messages for a chat room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId).select('messages');
    
    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    res.json(room.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

module.exports = router;
