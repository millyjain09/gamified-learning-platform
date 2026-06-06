const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app); 

// Socket.io Server Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('MongoDB Connection Error: ', err));


// --- REAL-TIME MATCHMAKING ENGINE  ---
let waitingPlayer = null; // Jo player match dhoondh raha hai wo yahan wait karega

io.on('connection', (socket) => {
  console.log('⚡ A Player Connected! Socket ID:', socket.id);

  socket.on('search_match', (playerData) => {
    console.log(`🔍 ${playerData.username} is searching for a match...`);

    if (waitingPlayer && waitingPlayer.socket.id !== socket.id) {
      // MATCH MIL GAYA! Ek player pehle se wait kar raha tha
      const roomName = `arena_${waitingPlayer.socket.id}_${socket.id}`;
      
      socket.join(roomName);
      waitingPlayer.socket.join(roomName);

      console.log(`⚔️ Match Started in ${roomName}`);

      io.to(roomName).emit('match_found', {
        room: roomName,
        opponentForP1: playerData, 
        opponentForP2: waitingPlayer.playerData 
      });

      waitingPlayer = null; 
    } else {
      waitingPlayer = { socket, playerData };
      console.log(`⏳ ${playerData.username} is waiting in queue...`);
    }
  });

  socket.on('question_solved', ({ room, qIdx }) => {
    // Apne opponent ko message bhejo ki "Maine solve kar liya hai!"
    socket.to(room).emit('opponent_solved', { qIdx });
  });

  socket.on('disconnect', () => {
    console.log('❌ Player Disconnected:', socket.id);
    if (waitingPlayer && waitingPlayer.socket.id === socket.id) {
      waitingPlayer = null; 
    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});