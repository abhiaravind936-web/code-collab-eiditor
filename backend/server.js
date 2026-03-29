const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store all rooms and their code
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('🟢 New user connected:', socket.id);

  // User joins a room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
    
    // If room exists, send existing code to new user
    if (rooms.has(roomId)) {
      const roomData = rooms.get(roomId);
      socket.emit('load-code', roomData.code);
    } else {
      // New room, initialize with default code
      const defaultCode = `// Welcome to Code Collab!\n// Start coding with your friends...\n\nconsole.log("Hello, collaborators! 👋");\n\n// Try running this code!`;
      rooms.set(roomId, { code: defaultCode, users: [] });
      socket.emit('load-code', defaultCode);
    }
    
    // Notify everyone in room about new user
    io.to(roomId).emit('user-joined', {
      userId: userId,
      message: `User ${userId} joined the room`
    });
  });

  // Handle code changes
  socket.on('code-change', ({ roomId, code }) => {
    // Save to our rooms map
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
    }
    // Broadcast to everyone else in the room
    socket.to(roomId).emit('code-update', code);
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, message, userId }) => {
    io.to(roomId).emit('new-message', {
      userId: userId,
      message: message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});
// Python code execution endpoint
app.post('/execute/python', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  // Create a temporary Python file
  const tempFile = path.join(__dirname, `temp_${Date.now()}.py`);
  
  // Write code to temp file
  fs.writeFileSync(tempFile, code);
  
  // Execute Python code with timeout (5 seconds)
  exec(`python "${tempFile}"`, { timeout: 5000 }, (error, stdout, stderr) => {
    // Delete temp file
    fs.unlinkSync(tempFile);
    
    if (error) {
      if (error.killed) {
        return res.json({ error: 'Execution timed out (5 seconds limit)' });
      }
      return res.json({ error: stderr || error.message });
    }
    
    if (stderr) {
      return res.json({ error: stderr });
    }
    
    res.json({ output: stdout });
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});