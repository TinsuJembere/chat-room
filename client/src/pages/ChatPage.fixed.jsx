import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const ChatPage = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const {
    currentRoom,
    messages,
    users,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    loading,
    error,
  } = useChat();

  // Join room on component mount
  useEffect(() => {
    if (roomName && !currentRoom) {
      console.log('Joining room:', roomName);
    }
  }, [roomName, currentRoom]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dark mode effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage({
      text: message,
      username: currentRoom?.createdBy || 'Anonymous',
    });
    
    setMessage('');
    sendTypingStatus(false);
  };

  const handleTyping = () => {
    if (!isTyping) {
      sendTypingStatus(true);
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
      setIsTyping(false);
    }, 2000);
  };

  const handleLeaveRoom = () => {
    navigate('/');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center text-blue-500 font-bold text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-1"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="hidden sm:inline">ChatApp</span>
          </div>
        </div>
        
        <div className="flex-1 text-center px-4">
          <h2 className="text-xl font-semibold">
            {currentRoom?.name || roomName || 'Chat Room'}
          </h2>
          {currentRoom?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md mx-auto">
              {currentRoom.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {currentRoom?.category && (
            <span className="hidden md:inline-block text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
              {currentRoom.category}
            </span>
          )}
          <button 
            onClick={handleLeaveRoom}
            className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* Room Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold">
                  {currentRoom?.name?.charAt(0) || 'R'}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {currentRoom?.name || 'Chat Room'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentRoom?.users?.length || 0} members
                </p>
              </div>
            </div>
            
            {currentRoom?.description && (
              <div className="mt-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {currentRoom.description}
                </p>
              </div>
            )}
            
            <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Created {currentRoom?.createdAt ? new Date(currentRoom.createdAt).toLocaleDateString() : 'recently'}
            </div>
          </div>

          {/* Online Users */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-gray-500 mb-2">Online Users</h3>
            <ul className="space-y-2">
              {loading ? (
                <li className="text-gray-400">Loading users...</li>
              ) : error ? (
                <li className="text-red-500">Error loading users</li>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <li key={user.id} className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full absolute -right-1 -top-1 border-2 border-white dark:border-gray-800"></div>
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">{user.name}</span>
                    {typingUsers[user.name] && (
                      <span className="text-xs text-gray-500">typing...</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No users online</li>
              )}
            </ul>
          </div>

          {/* User Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <ul className="space-y-1">
              <li className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <span className="text-gray-500 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Settings
              </li>
              <li className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <span className="text-gray-500 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 3h-2v10h2V3zm4.23 2.82l-1.42 1.42c2.19 2.19 2.19 5.75 0 7.94l1.42 1.42c2.93-2.93 2.93-7.68 0-10.6zm-10.46 0c-2.93 2.93-2.93 7.68 0 10.6l1.42-1.42c-2.19-2.19-2.19-5.75 0-7.94l-1.42-1.42z" />
                  </svg>
                </span>
                Sign Out
              </li>
            </ul>

            {/* Dark Mode Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">
                Error loading messages. Please try again.
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.username === (currentRoom?.createdBy || 'Anonymous')
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl rounded-lg p-3 ${
                        msg.username === (currentRoom?.createdBy || 'Anonymous')
                          ? 'bg-blue-500 text-white rounded-tr-none'
                          : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold">
                          {msg.username}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="break-words">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-2 opacity-50"
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
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleMessageSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim()) {
                        handleMessageSubmit(e);
                      }
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-3 px-4 pl-5 pr-16 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                  disabled={loading}
                  aria-label="Type your message"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || loading}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                    message.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  } transition-colors`}
                  aria-label="Send message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
              
              {/* Typing indicators */}
              {Object.keys(typingUsers).filter(username => 
                typingUsers[username] && username !== (currentRoom?.createdBy || 'Anonymous')
              ).length > 0 && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <div className="flex -space-x-1 mr-2">
                    {Object.entries(typingUsers)
                      .filter(([username, isTyping]) => isTyping && username !== (currentRoom?.createdBy || 'Anonymous'))
                      .slice(0, 3)
                      .map(([username]) => (
                        <div 
                          key={username}
                          className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {username.charAt(0).toUpperCase()}
                        </div>
                      ))
                    }
                  </div>
                  <span>
                    {Object.entries(typingUsers).filter(([_, isTyping]) => isTyping).length > 3 
                      ? 'Several people are typing...' 
                      : 'is typing...'}
                  </span>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="p-4 bg-gray-900 text-gray-400 text-sm">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="mb-2 md:mb-0">
            © {new Date().getFullYear()} ChatApp. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
