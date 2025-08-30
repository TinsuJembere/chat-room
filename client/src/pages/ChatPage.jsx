import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';

// Format timestamp to readable time
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const username = location.state?.username || 'Anonymous';

  const {
    currentRoom,
    messages,
    users,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    joinRoom,
    loading,
    error,
    socket, // Make sure socket is destructured from useChat
  } = useChat();

  // Join room on mount
  useEffect(() => {
    const joinChatRoom = async () => {
      if (roomId && (!currentRoom || currentRoom._id !== roomId)) {
        try {
          await joinRoom(roomId, username);
          // If join is successful, the room data will be in currentRoom
          if (!currentRoom || currentRoom._id !== roomId) {
            throw new Error('Failed to join room: No room data received');
          }
        } catch (err) {
          console.error('Failed to join room:', err);
          alert(`Failed to join room: ${err.message}`);
          navigate('/');
        }
      }
    };
    
    joinChatRoom();
  }, [roomId, currentRoom, joinRoom, username, navigate]);
  
  // Handle leaving the room when component unmounts or room changes
  useEffect(() => {
    return () => {
      // Clean up any resources or disconnect from the room if needed
      if (socket && currentRoom) {
        socket.emit('leave_room', currentRoom._id, username);
      }
    };
  }, [socket, currentRoom, username]);

  // Add debug logging
  useEffect(() => {
    console.log('Current Room:', currentRoom);
    console.log('Messages:', messages);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [currentRoom, messages, loading, error]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    try {
      await sendMessage({
        text: message,
        username: username,
        roomId: currentRoom._id
      });
      
      // Clear the input field after successful send
      setMessage('');
      sendTypingStatus(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show an error message to the user
      alert('Failed to send message. Please try again.');
    }
  };

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 3000);
  }, [isTyping, sendTypingStatus]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  // Get list of users currently typing
  const getTypingUsersText = useCallback(() => {
    const typingUserList = Object.entries(typingUsers)
      .filter(([_, isTyping]) => isTyping && _ !== username)
      .map(([username]) => username);

    if (typingUserList.length === 0) return null;
    if (typingUserList.length === 1) return `${typingUserList[0]} is typing...`;
    if (typingUserList.length === 2) return `${typingUserList[0]} and ${typingUserList[1]} are typing...`;
    return 'Several people are typing...';
  }, [typingUsers, username]);

  const handleLeaveRoom = () => {
    navigate('/');
  };

  // Get dark mode state and toggle function from ThemeContext
  const { darkMode, toggleDarkMode } = useTheme();

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg max-w-md w-full text-center">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center text-blue-500 font-bold text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-1"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="hidden sm:inline">ChatApp</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {currentRoom?.name || 'Chat Room'}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* Online Users */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Online Users ({users.length})
            </h3>
            <ul className="space-y-2">
              {users.map((user, index) => (
                <li key={user.id || index} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <span className="ml-3 text-gray-800 dark:text-gray-200 truncate">
                    {user.username || `User ${index + 1}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLeaveRoom}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Leave Room
            </button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No messages</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get the conversation started by sending a message.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg._id || msg.tempId}
                  className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl rounded-lg px-4 py-2 mb-2 transition-colors duration-200 ${
                      msg.sender === username
                        ? 'bg-blue-600 text-white rounded-br-none dark:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none'
                    }`}
                  >
                    <div className="font-medium">{msg.sender}</div>
                    <div>{msg.text}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {getTypingUsersText() && (
            <div className="px-6 py-1 text-sm text-gray-500 dark:text-gray-400">
              {getTypingUsersText()}
            </div>
          )}

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-colors duration-200">
            <form onSubmit={handleMessageSubmit} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
