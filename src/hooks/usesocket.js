import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// IMPORTANT: Replace with your actual Render/Railway URL
const SOCKET_URL = 'https://code-collab-eiditor.onrender.com'; // ← CHANGE THIS

export const useSocket = (roomId, userId) => {
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId || !userId) {
      console.log('Waiting for roomId and userId...');
      return;
    }

    console.log('Connecting to server at:', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected, joining room:', roomId);
      newSocket.emit('join-room', roomId, userId);
    });

    // Listen for code updates from other users
    newSocket.on('load-code', (initialCode) => {
      console.log('📥 Received initial code from server');
      setCode(initialCode);
    });

    newSocket.on('code-update', (updatedCode) => {
      console.log('📥 Received code update from other user');
      setCode(updatedCode);
    });

    newSocket.on('new-message', (message) => {
      console.log('💬 New message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    return () => {
      console.log('Disconnecting socket');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId, userId]);

  const sendCodeChange = (newCode) => {
    if (socket && roomId) {
      console.log('📤 Sending code change to room:', roomId);
      socket.emit('code-change', { roomId, code: newCode });
      setCode(newCode);
    } else {
      console.log('Cannot send code: socket or roomId missing');
    }
  };

  const sendMessage = (message, userId) => {
    if (socket && roomId && message.trim()) {
      socket.emit('send-message', { roomId, message, userId });
    }
  };

  return {
    code,
    messages,
    sendCodeChange,
    sendMessage
  };
};
