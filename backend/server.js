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

const JAVAC_PATH = 'C:\\Program Files\\Eclipse Adoptium\\jdk-25.0.2.10-hotspot\\bin\\javac.exe';
const JAVA_PATH = 'C:\\Program Files\\Eclipse Adoptium\\jdk-25.0.2.10-hotspot\\bin\\java.exe';

console.log('✅ Java compiler path:', JAVAC_PATH);
console.log('✅ Java runtime path:', JAVA_PATH);
// ========================================

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
// Python code execution endpoint (UPDATED)
app.post('/execute/python', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  // Create a temporary Python file
  const tempFile = path.join(__dirname, `temp_${Date.now()}.py`);
  
  // Write code to temp file
  fs.writeFileSync(tempFile, code);
  
  console.log('🐍 Executing Python code...');
  
  // Try different Python commands (for different systems)
  const pythonCommands = ['python3', 'python', 'py'];
  let currentIndex = 0;
  
  function tryExecute() {
    if (currentIndex >= pythonCommands.length) {
      fs.unlinkSync(tempFile);
      return res.json({ error: 'Python is not installed on the server. Please install Python.' });
    }
    
    const pythonCmd = pythonCommands[currentIndex];
    console.log(`📁 Trying Python command: ${pythonCmd}`);
    
    // Execute Python code with timeout (5 seconds)
    exec(`${pythonCmd} "${tempFile}"`, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${pythonCmd} failed, trying next...`);
        currentIndex++;
        tryExecute();
        return;
      }
      
      // Delete temp file
      fs.unlinkSync(tempFile);
      
      if (stderr) {
        return res.json({ error: stderr });
      }
      
      console.log('✅ Python executed successfully');
      res.json({ output: stdout });
    });
  }
  
  tryExecute();
});
// Java code execution endpoint (UPDATED)
app.post('/execute/java', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  // Extract class name from code (supports any public class name)
  const classNameMatch = code.match(/public\s+class\s+(\w+)/);
  if (!classNameMatch) {
    return res.json({ error: 'Java code must have a public class. Example: public class Main { ... }' });
  }
  
  const className = classNameMatch[1];
  const tempDir = path.join(__dirname, `temp_${Date.now()}`);
  
  console.log(`☕ Compiling Java class: ${className}`);
  
  // Try different Java commands
  const javaCommands = ['javac', 'javac.exe'];
  let javacCmd = null;
  
  // Find which javac works
  for (const cmd of javaCommands) {
    try {
      const { execSync } = require('child_process');
      execSync(`where ${cmd}`, { stdio: 'ignore' });
      javacCmd = cmd;
      break;
    } catch(e) {
      // Command not found
    }
  }
  
  // If on Windows with specific path
  const windowsJavaPath = 'C:\\Program Files\\Eclipse Adoptium\\jdk-25.0.2.10-hotspot\\bin\\javac.exe';
  if (fs.existsSync(windowsJavaPath)) {
    javacCmd = `"${windowsJavaPath}"`;
  }
  
  if (!javacCmd) {
    return res.json({ error: 'Java compiler (javac) not found on server' });
  }
  
  try {
    // Create temp directory
    fs.mkdirSync(tempDir);
    
    // Write Java file
    const javaFile = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(javaFile, code);
    
    // Compile Java code
    exec(`${javacCmd} "${javaFile}"`, { timeout: 10000 }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        return res.json({ error: `Compilation error:\n${compileStderr || compileError.message}` });
      }
      
      console.log(`✅ Java compiled successfully, running...`);
      
      // Run Java code
      const javaCmd = javacCmd.replace('javac', 'java').replace('javac.exe', 'java.exe');
      exec(`${javaCmd} -cp "${tempDir}" ${className}`, { timeout: 5000 }, (runError, runStdout, runStderr) => {
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        if (runError) {
          if (runError.killed) {
            return res.json({ error: 'Execution timed out (5 seconds limit)' });
          }
          return res.json({ error: `Runtime error:\n${runStderr || runError.message}` });
        }
        
        if (runStderr) {
          return res.json({ error: runStderr });
        }
        
        console.log('✅ Java executed successfully');
        res.json({ output: runStdout });
      });
    });
  } catch (err) {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    res.json({ error: err.message });
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});