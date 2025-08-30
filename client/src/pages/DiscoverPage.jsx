import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Reusable Room Card component
const RoomCard = ({ id, name, description, participants, createdBy, onJoin }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">{description || 'No description provided'}</p>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        {participants} {participants === 1 ? 'Participant' : 'Participants'}
      </div>
      {createdBy && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Created by: {createdBy}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto">
        <button 
          onClick={() => onJoin(id, name)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

const DiscoverPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Fetch rooms from the backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://chat-room-goiw.onrender.com/api/rooms');
        setRooms(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load chat rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Handle joining a room
  const handleJoinRoom = async (roomId, roomName) => {
    const username = prompt('Enter your username:');
    if (!username || !username.trim()) return;
    
    try {
      // Navigate to the chat page with the room ID and username
      navigate(`/chat/${roomId}`, { 
        state: { 
          username: username.trim(),
          roomName: roomName || `Room ${roomId}`
        },
        replace: true // Replace the current entry in the history stack
      });
    } catch (err) {
      console.error('Error joining room:', err);
      alert(`Failed to join the room: ${err.message || 'Please try again.'}`);
    }
  };

  // Filter rooms based on search and category
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(rooms.map(room => room.category).filter(Boolean))];

  // Separate featured rooms (first 4 rooms) and all rooms
  const featuredRooms = filteredRooms.slice(0, 4);
  const allRooms = filteredRooms.slice(4);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-blue-600 p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center text-white text-2xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">logo</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
              Create New Room
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">Discover Your Next Conversation</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse public chat rooms or create your own to connect with like-minded individuals.
          </p>
          <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Create New Room
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-2/3">
            <input
              type="text"
              placeholder="Search rooms by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 p-3 pl-10 rounded-lg border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
          <div className="w-full md:w-1/3">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Rooms Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg mb-8">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {featuredRooms.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Featured Rooms</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredRooms.map((room) => (
                    <RoomCard 
                      key={room.id} 
                      {...room} 
                      onJoin={handleJoinRoom}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Rooms Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                {filteredRooms.length === 0 ? 'No rooms found' : 'All Rooms'}
              </h2>
              {filteredRooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No chat rooms match your search criteria.</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allRooms.map((room) => (
                    <RoomCard 
                      key={room.id} 
                      {...room} 
                      onJoin={handleJoinRoom}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 bg-gray-900 text-gray-400 text-sm mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="mb-2 md:mb-0">
            Made with <a href="#" className="underline">Visily</a>
          </div>
          <div className="flex space-x-4 mb-2 md:mb-0">
            <a href="#" className="hover:underline">Resources</a>
            <a href="#" className="hover:underline">Legal</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.43 9.79 8.22 11.39.6.11.82-.26.82-.57v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.78-1.34-1.78-1.09-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.49.99.11-.77.42-1.3.76-1.6C7.2 14.85 4.3 13.73 4.3 8.3c0-1.3.46-2.38 1.22-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.22A11.5 11.5 0 0112 5.86c1.02 0 2.06.14 3.02.42 2.29-1.54 3.29-1.22 3.29-1.22.65 1.66.24 2.88.12 3.18.76.84 1.22 1.92 1.22 3.22 0 5.44-2.9 6.56-5.63 6.87.43.37.81 1.1.81 2.22v3.29c0 .31.21.68.83.57C20.57 21.79 24 17.31 24 12 24 5.37 18.63 0 12 0z" /></svg></a>
            <a href="#" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.34-1.6.56-2.48.66.89-.53 1.57-1.37 1.89-2.37-.83.49-1.75.84-2.72 1.03C18.42 4.4 17.2 4 15.86 4c-2.36 0-4.28 1.92-4.28 4.28 0 .34.04.67.11.99-3.56-.18-6.72-1.89-8.83-4.48-.37.64-.58 1.39-.58 2.18 0 1.49.76 2.81 1.92 3.59-.7-.02-1.36-.21-1.93-.53v.05c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.54 1.7 2.12 2.94 3.99 2.98-1.47 1.15-3.32 1.84-5.34 1.84-.35 0-.69-.02-1.03-.06 1.9 1.22 4.15 1.92 6.58 1.92 7.9 0 12.22-6.55 12.22-12.22 0-.19-.01-.38-.01-.56.84-.6 1.56-1.35 2.14-2.2z" /></svg></a>
            <a href="#" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.47 21.5H16V14c0-1.74-.6-2.88-2.25-2.88-1.22 0-2.31.81-2.69 1.6l-.06-.06V14h-3.92s.05-10.96 0-12.01h3.92V9c.56-.81 1.54-1.45 3.5-1.45 2.5 0 4.41 1.63 4.41 5.18v8.78zM7.09 8.24c-1.34 0-2.19-.8-2.19-1.9 0-1.07.82-1.9 2.17-1.9s2.19.83 2.19 1.9c0 1.1-.82 1.9-2.17 1.9zM5.18 21.5H9V9.5H5.18v12z" /></svg></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DiscoverPage;