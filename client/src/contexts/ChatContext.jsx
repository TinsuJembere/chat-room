import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://chat-room-goiw.onrender.com/api' 
  : 'http://localhost:5000/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' 
      ? 'https://chat-room-goiw.onrender.com' 
      : 'http://localhost:5000',
    {
      withCredentials: true,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*',
      },
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => newSocket.close();
  }, []);

  // Create a new chat room
  const createRoom = async (roomData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/chat/rooms`, roomData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Join an existing chat room
  const joinRoom = async (roomId, username) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Attempting to join room ${roomId} as ${username}`);
      
      // First, join the room
      const joinResponse = await axios.post(
        `${API_URL}/chat/rooms/${roomId}/join`, 
        { username },
        { 
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );

      if (joinResponse.status >= 400) {
        const errorMsg = joinResponse.data?.message || 'Failed to join room';
        console.error('Server error:', joinResponse.data);
        throw new Error(errorMsg);
      }

      console.log('Room join response:', joinResponse.data);
      
      // Then, fetch the room's messages
      const messagesResponse = await axios.get(
        `${API_URL}/chat/rooms/${roomId}/messages`,
        { 
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status < 500
        }
      );
      
      const messages = messagesResponse.data || [];
      
      // Update room data in context
      const roomData = {
        ...joinResponse.data,
        _id: roomId, // Ensure roomId is set correctly
        name: joinResponse.data.name || `Room ${roomId}`,
        users: joinResponse.data.users || []
      };
      
      setCurrentRoom(roomData);
      setMessages(messages.map(msg => ({
        username: msg.user,
        text: msg.message,
        timestamp: msg.timestamp
      })));
      setUsers(joinResponse.data.users || []);
      
      // Join room via socket if not already in the room
      if (socket && !joinResponse.data.alreadyInRoom) {
        console.log('Emitting join_room to socket');
        socket.emit('join_room', roomId, username);
      }
      
      // Return room data with flag indicating if user was already in the room
      return {
        ...roomData,
        wasAlreadyInRoom: joinResponse.data.alreadyInRoom || false
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join room';
      console.error('Error joining room:', {
        error: err,
        response: err.response?.data,
        roomId,
        username
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (message) => {
    console.log('Attempting to send message:', { message, currentRoom, socket: !!socket });
    
    if (!socket || !currentRoom) {
      console.error('Cannot send message: missing socket or currentRoom', { hasSocket: !!socket, hasRoom: !!currentRoom });
      return;
    }
    
    try {
      console.log('Saving message to backend...');
      // Save message to the backend
      const response = await axios.post(
        `${API_URL}/chat/rooms/${currentRoom._id}/messages`,
        {
          username: message.username,
          message: message.text
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      console.log('Message saved to backend:', response.data);

      // Emit the message via socket for real-time updates
      const socketPayload = {
        roomId: currentRoom._id,
        username: message.username,
        message: message.text,
        timestamp: new Date().toISOString()
      };
      
      console.log('Emitting send_message event:', socketPayload);
      socket.emit('send_message', socketPayload);
      
      // Return the saved message data
      return response.data;
    } catch (error) {
      console.error('Error sending message:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to send message: ' + (error.response?.data?.message || error.message));
      throw error; // Re-throw to allow handling in the component
    }
  };

  // Handle typing indicator
  const sendTypingStatus = (isTyping) => {
    if (!socket || !currentRoom) return;
    
    socket.emit('typing', {
      roomId: currentRoom._id,
      username: currentRoom.username,
      isTyping
    });
  };

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle incoming messages
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, {
        username: data.username,
        text: data.message,
        timestamp: data.timestamp
      }]);
    });

    // Handle user join events
    socket.on('user_joined', (data) => {
      setUsers(data.users);
    });

    // Handle typing indicators
    socket.on('user_typing', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.username]: data.isTyping
      }));

      // Clear typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.username]: false
          }));
        }, 3000);
      }
    });

    // Clean up event listeners
    return () => {
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_typing');
    };
  }, [socket]);

  // Fetch all available rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/chat/rooms`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    socket, // Make sure socket is included in the context value
    currentRoom,
    messages,
    users,
    typingUsers,
    error,
    loading,
    createRoom,
    joinRoom,
    sendMessage,
    sendTypingStatus,
    setError,
    fetchRooms,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
