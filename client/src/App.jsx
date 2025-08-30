import { Routes, Route } from 'react-router-dom'
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import InstantChatForm from './pages/InstantChatForm'
import ChatPage from './pages/ChatPage'
import DiscoverPage from './pages/DiscoverPage'

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<InstantChatForm />} />
            <Route path="/chat/:roomId" element={<ChatPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Routes>
        </div>
      </ChatProvider>
    </ThemeProvider>
  )
}

export default App
