import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = `http://${window.location.hostname}:5000`;

export const useSocket = (roomId, userId) => {
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Only connect if we have both roomId and userId
    if (!roomId || !userId) {
      console.log('Waiting for roomId and userId...');
      return;
    }

    console.log('Connecting to server with:', { roomId, userId });
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join the room after connection is established
    newSocket.on('connect', () => {
      console.log('Socket connected, joining room:', roomId);
      newSocket.emit('join-room', roomId, userId);
    });

    // Listen for code updates
    newSocket.on('load-code', (initialCode) => {
      console.log('Received initial code');
      setCode(initialCode);
    });

    newSocket.on('code-update', (updatedCode) => {
      console.log('Received code update');
      setCode(updatedCode);
    });

    // Listen for messages
    newSocket.on('new-message', (message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting socket');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId, userId]);

  const sendCodeChange = (newCode) => {
    if (socket && roomId) {
      socket.emit('code-change', { roomId, code: newCode });
      setCode(newCode);
    } else {
      console.log('Cannot send code: socket or roomId missing');
    }
  };

  const sendMessage = (message, userId) => {
    if (socket && roomId && message.trim()) {
      socket.emit('send-message', { roomId, message, userId });
    } else {
      console.log('Cannot send message: socket or roomId missing');
    }
  };

  return {
    code,
    messages,
    sendCodeChange,
    sendMessage
  };
};