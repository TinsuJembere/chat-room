# Real-time Chat Application

A modern, real-time chat application built with React, Node.js, and Socket.IO. This application allows users to join chat rooms and exchange messages in real-time with a clean, responsive interface.

![Chat Application Preview](https://via.placeholder.com/800x400.png?text=Chat+Application+Preview)

## ✨ Features

- Real-time messaging using Socket.IO
- Multiple chat rooms support
- Responsive design with Tailwind CSS
- User-friendly interface
- Modern React (v19) with Vite
- Easy to set up and deploy

## 🚀 Tech Stack

**Client:**
- React 19
- Vite
- Tailwind CSS
- Socket.IO Client
- React Router DOM
- Axios

**Server:**
- Node.js
- Express
- Socket.IO
- CORS
- Dotenv

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TinsuJembere/chat-app.git
   cd chat-app
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

## ⚙️ Configuration

1. Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=your mongodb uri
   ```

## 🚦 Running the Application

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client**
   ```bash
   cd ../client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## 📝 Usage

1. Enter your username and choose a chat room
2. Start sending messages in real-time
3. Invite others to join the same room to chat together

## 📂 Project Structure

```
chat-app/
├── client/               # Frontend React application
│   ├── public/          # Static files
│   ├── src/             # React source code
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   └── ...
├── server/              # Backend server
│   ├── src/
│   │   ├── server.js    # Main server file
│   │   └── socket.js    # Socket.IO configuration
│   └── ...
└── README.md            # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ by Tinsae
