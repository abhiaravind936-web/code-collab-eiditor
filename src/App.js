import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/usesocket';  
import CodeEditor from './components/Editor/Editor';
import Chat from './components/Chat/chat';  
import Output from './components/output/output'; 
import MultiLanguageEditor from './components/MultiLanguageEditor/MultiLanguageEditor';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [joined, setJoined] = useState(false);
  const [editorMode, setEditorMode] = useState('code'); 
  const [code, setCode] = useState('');

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    const newUserId = `User_${Math.floor(Math.random() * 1000)}`;
    console.log('📁 Creating room:', newRoomId);
    setRoomId(newRoomId);
    setUserId(newUserId);
    setJoined(true);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      const newUserId = `User_${Math.floor(Math.random() * 1000)}`;
      console.log('🔗 Joining room:', roomId);
      setUserId(newUserId);
      setJoined(true);
    }
  };


  const { code: socketCode, messages, sendCodeChange, sendMessage } = useSocket(
    joined ? roomId : null,
    joined ? userId : null
  );

  useEffect(() => {
    if (socketCode) {
      console.log('📥 Syncing code from server:', socketCode.substring(0, 50));
      setCode(socketCode);
    }
  }, [socketCode]);

  const handleCodeChange = (newCode) => {
    console.log('📤 Sending code change to server');
    setCode(newCode);
    sendCodeChange(newCode);
  };

  if (!joined) {
    return (
      <div className="app-container">
        <div className="landing">
          <h1 className="title">✨ Code Collab Editor ✨</h1>
          <p className="subtitle">Multi-language collaborative coding with live preview</p>
          
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
        
        {/* Mode Selector */}
        <div className="mode-selector">
          <button 
            className={`mode-btn ${editorMode === 'code' ? 'active' : ''}`}
            onClick={() => setEditorMode('code')}
          >
            💻 Code Editor (JS/Python/Java)
          </button>
          <button 
            className={`mode-btn ${editorMode === 'web' ? 'active' : ''}`}
            onClick={() => setEditorMode('web')}
          >
            🌐 Web Development (HTML/CSS/JS)
          </button>
        </div>
        
        <div className="editor-chat-container">
          <div className="editor-area">
            <h3>📝 {editorMode === 'code' ? 'Code Editor' : 'Web Editor'}</h3>
            {editorMode === 'code' ? (
              <CodeEditor 
                code={code} 
                onChange={handleCodeChange}  
              />
            ) : (
              <MultiLanguageEditor />
            )}
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
        
        {editorMode === 'code' && (
          <div className="output-area">
            <h3>▶️ Output</h3>
            <Output code={code} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;