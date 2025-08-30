import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const InstantChatForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    roomName: '', // For creating a new room
    roomId: '',   // For joining an existing room
    roomDescription: '',
    roomCategory: 'General',
  });
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  
  const { createRoom, joinRoom, loading, error: chatError, fetchRooms } = useChat();
  const navigate = useNavigate();

  // Fetch available rooms when component mounts or when switching to join mode
  useEffect(() => {
    const loadRooms = async () => {
      if (isJoining) {
        try {
          const rooms = await fetchRooms();
          setAvailableRooms(rooms);
        } catch (error) {
          console.error('Error loading rooms:', error);
          setError('Failed to load available rooms');
        }
      }
    };
    loadRooms();
  }, [isJoining]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (isJoining && !formData.roomId) {
      setError('Please select a room to join');
      return;
    }

    if (!isJoining && !formData.roomName.trim()) {
      setError('Room name is required');
      return;
    }

    try {
      let roomIdToJoin;
      
      if (isJoining) {
        // Join existing room
        const result = await joinRoom(formData.roomId, formData.username);
        roomIdToJoin = formData.roomId;
        
        // If user was already in the room, show a message
        if (result.wasAlreadyInRoom) {
          console.log('User was already in the room, redirecting to chat...');
        }
      } else {
        // Create new room
        const newRoom = await createRoom({
          name: formData.roomName,
          description: formData.roomDescription || 'A new chat room',
          username: formData.username
        });
        roomIdToJoin = newRoom._id;
        await joinRoom(roomIdToJoin, formData.username);
      }

      // Navigate to chat page after successful join/create
      navigate(`/chat/${roomIdToJoin}`, {
        state: { 
          username: formData.username,
          fromJoin: isJoining
        },
        replace: true // Replace current entry in history
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const toggleJoinCreate = () => {
    setIsJoining(!isJoining);
    setError('');
  };
  return (
    <div>
      <header className="bg-blue-600 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center text-white text-2xl font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            InstantChat
          </div>
          <button 
            onClick={toggleJoinCreate}
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            {isJoining ? 'Create a Room' : 'Join a Room'}
          </button>
        </div>
      </header>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-2">
            {isJoining ? 'Join a Chat Room' : 'Create a New Room'}
          </h2>
          <p className="text-center text-gray-500 mb-6">
            {isJoining 
              ? 'Enter the room details to join an existing chat.'
              : 'Create a new chat room and invite others to join you!'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium mb-1"
              >
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="roomName"
                className="block text-gray-700 font-medium mb-1"
              >
                {isJoining ? 'Select a Room *' : 'Room Name *'}
              </label>
              {isJoining ? (
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select a room --</option>
                  {availableRooms.map(room => (
                    <option key={room._id} value={room._id}>
                      {room.name} ({room.users?.length || 0} users)
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="roomName"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleChange}
                  placeholder="Enter a name for your room"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
            </div>

            {!isJoining && (
              <div className="mb-4">
                <label
                  htmlFor="roomDescription"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Room Description (Optional)
                </label>
                <textarea
                  id="roomDescription"
                  name="roomDescription"
                  value={formData.roomDescription}
                  onChange={handleChange}
                  placeholder="A short description of your room's topic or purpose"
                  className="w-full p-2 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
            )}

            {!isJoining && (
              <div className="mb-6">
                <label
                  htmlFor="roomCategory"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Room Category
                </label>
                <select
                  id="roomCategory"
                  name="roomCategory"
                  value={formData.roomCategory}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General">General</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isJoining ? 'Joining...' : 'Creating...'}
                </>
              ) : isJoining ? 'Join Room' : 'Create Room'}
            </button>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleJoinCreate}
                className="text-blue-600 hover:underline text-sm"
              >
                {isJoining ? 'Or create a new room' : 'Or join an existing room'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="bg-white text-black py-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">

          {/* Center links */}
          <div className="flex space-x-4 my-2 md:my-0">
            <a href="#" className="hover:underline text-sm">
              Resources
            </a>
            <a href="#" className="hover:underline text-sm">
              Legal
            </a>
          </div>

          {/* Right social icons */}
          <div className="flex space-x-4">
            <a href="#" aria-label="GitHub">
              {/* GitHub Icon (you'd use an SVG or icon library here) */}
              <svg
                className="h-5 w-5 fill-current"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 17 2.19A8.13 8.13 0 0012 2c-1.57 0-3.11.28-4.5.83-1.73-1.54-2.91-2.19-2.91-2.19S2.46 6.13 2 7.73A5.44 5.44 0 004 12.33c0 5.46 3.3 6.64 6.44 7A3.37 3.37 0 009 19zm-5-8l5 5"></path>
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              {/* Twitter Icon */}
              <svg
                className="h-5 w-5 fill-current"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              {/* LinkedIn Icon */}
              <svg
                className="h-5 w-5 fill-current"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InstantChatForm;
