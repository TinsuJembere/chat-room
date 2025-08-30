const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    enum: ['General', 'Gaming', 'Technology']
  },
  createdBy: {
    type: String,
    required: true
  },
  users: [{
    username: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    user: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a method to add a message to the chat room
chatRoomSchema.methods.addMessage = async function(username, message) {
  this.messages.push({ user: username, message });
  return this.save();
};

// Add a method to add a user to the chat room
chatRoomSchema.methods.addUser = async function(username) {
  try {
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid username');
    }

    // Check if user already exists in the room
    const userExists = this.users.some(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );

    if (!userExists) {
      // Add user to the room
      this.users.push({ 
        username: username.trim(),
        joinedAt: new Date()
      });
      
      // Save the updated room
      await this.save();
      console.log(`User ${username} added to room ${this._id}`);
    } else {
      console.log(`User ${username} already in room ${this._id}`);
    }

    return this;
  } catch (error) {
    console.error('Error in addUser:', error);
    throw error;
  }
};

// Add a method to remove a user from the chat room
chatRoomSchema.methods.removeUser = async function(username) {
  this.users = this.users.filter(user => user.username !== username);
  return this.save();
};

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
