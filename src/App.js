import React, { useState } from 'react';
import { useSocket } from './hooks/usesocket';
import CodeEditor from './components/Editor/Editor';
import Chat from './components/Chat/chat';
import Output from './components/output/output';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [joined, setJoined] = useState(false);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    const newUserId = `User_${Math.floor(Math.random() * 1000)}`;
    console.log('Creating room:', newRoomId, 'User:', newUserId);
    setRoomId(newRoomId);
    setUserId(newUserId);
    setJoined(true);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      const newUserId = `User_${Math.floor(Math.random() * 1000)}`;
      console.log('Joining room:', roomId, 'User:', newUserId);
      setUserId(newUserId);
      setJoined(true);
    }
  };

  const { code, messages, sendCodeChange, sendMessage } = useSocket(
    joined ? roomId : null,
    joined ? userId : null
  );

  if (!joined) {
    return (
      <div className="app-container">
        <div className="landing">
          <h1 className="title">✨ Code Collab Editor ✨</h1>
          <p className="subtitle">Real-time collaborative coding with friends</p>
          
          <div className="room-actions">
            <button onClick={createRoom} className="btn btn-primary">
              Create New Room
            </button>
            
            <div className="divider">OR</div>
            
            <form onSubmit={joinRoom} className="join-form">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="input"
              />
              <button type="submit" className="btn btn-secondary">
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="workspace">
        <div className="room-info">
          <span className="room-badge">Room: {roomId}</span>
          <span className="room-badge" style={{ background: '#4CAF50' }}>
            You: {userId}
          </span>
          <button 
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="copy-btn"
          >
            📋 Copy Room Link
          </button>
        </div>
        
        <div className="editor-chat-container">
          <div className="editor-area">
            <h3>📝 Code Editor</h3>
            <CodeEditor 
              code={code} 
              onChange={sendCodeChange}
            />
          </div>
          
          <div className="chat-area">
            <h3>💬 Chat</h3>
            <Chat 
              messages={messages}
              onSendMessage={sendMessage}
              userId={userId}
            />
          </div>
        </div>
        
        <div className="output-area">
          <h3>▶️ Output</h3>
          <Output code={code} />
        </div>
      </div>
    </div>
  );
}

export default App;