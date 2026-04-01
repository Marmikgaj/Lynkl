import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store rooms in memory (ephemeral - no persistence)
const rooms = new Map();

// CORS middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId,
    participantCount: room.participants.length,
    createdAt: room.createdAt
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join room
  socket.on('join-room', ({ roomId, username }) => {
    console.log(`User ${username} (${socket.id}) joining room ${roomId}`);
    
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: [],
        createdAt: new Date().toISOString()
      });
    }
    
    const room = rooms.get(roomId);
    
    // Add participant
    room.participants.push({
      id: socket.id,
      username,
      joinedAt: new Date().toISOString()
    });
    
    // Join the socket room
    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      id: socket.id,
      username
    });
    
    // Send existing participants to the new user
    const existingParticipants = room.participants.filter(p => p.id !== socket.id);
    socket.emit('existing-participants', existingParticipants);
    
    // Update room participant count
    io.to(roomId).emit('room-update', {
      participantCount: room.participants.length
    });
    
    console.log(`Room ${roomId} now has ${room.participants.length} participants`);
  });
  
  // WebRTC signaling: offer
  socket.on('offer', ({ targetId, offer }) => {
    console.log(`Relaying offer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit('offer', {
      senderId: socket.id,
      senderName: socket.username,
      offer
    });
  });
  
  // WebRTC signaling: answer
  socket.on('answer', ({ targetId, answer }) => {
    console.log(`Relaying answer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit('answer', {
      senderId: socket.id,
      answer
    });
  });
  
  // WebRTC signaling: ICE candidate
  socket.on('ice-candidate', ({ targetId, candidate }) => {
    socket.to(targetId).emit('ice-candidate', {
      senderId: socket.id,
      candidate
    });
  });
  
  // Chat message
  socket.on('chat-message', ({ roomId, message }) => {
    console.log(`Chat message in room ${roomId} from ${socket.username}`);
    
    // Broadcast to all in room (including sender for confirmation)
    io.to(roomId).emit('chat-message', {
      id: Date.now().toString(),
      username: socket.username,
      text: message,
      timestamp: Date.now()
    });
  });
  
  // Typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('user-typing', {
      username: socket.username,
      isTyping
    });
  });
  
  // Reaction
  socket.on('reaction', ({ roomId, emoji }) => {
    io.to(roomId).emit('reaction', {
      username: socket.username,
      emoji,
      timestamp: Date.now()
    });
  });
  
  // Screen sharing status
  socket.on('screen-share', ({ roomId, isSharing }) => {
    socket.to(roomId).emit('user-screen-share', {
      userId: socket.id,
      isSharing
    });
  });
  
  // Raise hand
  socket.on('raise-hand', ({ roomId, isRaised }) => {
    io.to(roomId).emit('user-raise-hand', {
      userId: socket.id,
      username: socket.username,
      isRaised
    });
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const roomId = socket.roomId;
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      // Remove participant
      room.participants = room.participants.filter(p => p.id !== socket.id);
      
      // Notify others
      socket.to(roomId).emit('user-left', {
        id: socket.id,
        username: socket.username
      });
      
      // Update room count
      io.to(roomId).emit('room-update', {
        participantCount: room.participants.length
      });
      
      // Clean up empty rooms
      if (room.participants.length === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        console.log(`Room ${roomId} now has ${room.participants.length} participants`);
      }
    }
  });
});

// Periodic cleanup of stale rooms (every 5 minutes)
setInterval(() => {
  const now = new Date();
  for (const [roomId, room] of rooms.entries()) {
    const createdAt = new Date(room.createdAt);
    const ageMinutes = (now - createdAt) / (1000 * 60);
    
    // Delete rooms older than 2 hours
    if (ageMinutes > 120) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (stale)`);
    }
  }
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Lynkl signaling server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
