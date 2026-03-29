import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import LivePreview from '../livepreview/livepreview';
import './MultiLanguageEditor.css';

const MultiLanguageEditor = ({ onCodeChange, initialCode }) => {
  const [activeTab, setActiveTab] = useState('html'); // 'html', 'css', 'js', 'preview'
  const [html, setHtml] = useState(initialCode?.html || `<!DOCTYPE html>
<html>
<head>
    <title>My Web Page</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to Code Collab!</h1>
        <p>Edit HTML, CSS, and JavaScript in real-time.</p>
        <button id="clickBtn">Click Me!</button>
        <div id="output"></div>
    </div>
</body>
</html>`);
  
  const [css, setCss] = useState(initialCode?.css || `.container {
    text-align: center;
    padding: 50px;
    font-family: 'Arial', sans-serif;
}

h1 {
    color: #667eea;
    animation: fadeIn 1s;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
    transition: transform 0.2s;
}

button:hover {
    transform: scale(1.05);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}`);

  const [js, setJs] = useState(initialCode?.js || `// JavaScript for interactive page
console.log("Page loaded!");

document.getElementById('clickBtn')?.addEventListener('click', () => {
    const output = document.getElementById('output');
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    output.innerHTML = \`<p style="color: \${randomColor}; margin-top: 20px;">Button clicked! 🎉</p>\`;
    console.log("Button clicked!");
});

// Add a cool effect
const container = document.querySelector('.container');
if (container) {
    container.style.transition = 'all 0.3s';
}`);

  const handleCodeChange = (value, type) => {
    if (type === 'html') {
      setHtml(value);
      onCodeChange?.({ html: value, css, js });
    } else if (type === 'css') {
      setCss(value);
      onCodeChange?.({ html, css: value, js });
    } else if (type === 'js') {
      setJs(value);
      onCodeChange?.({ html, css, js: value });
    }
  };

  const getEditorContent = () => {
    switch(activeTab) {
      case 'html': return html;
      case 'css': return css;
      case 'js': return js;
      default: return '';
    }
  };

  const getLanguage = () => {
    switch(activeTab) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      default: return 'html';
    }
  };

  return (
    <div className="multi-language-editor">
      <div className="editor-tabs">
        <button 
          className={`tab-btn ${activeTab === 'html' ? 'active' : ''}`}
          onClick={() => setActiveTab('html')}
        >
          📄 index.html
        </button>
        <button 
          className={`tab-btn ${activeTab === 'css' ? 'active' : ''}`}
          onClick={() => setActiveTab('css')}
        >
          🎨 style.css
        </button>
        <button 
          className={`tab-btn ${activeTab === 'js' ? 'active' : ''}`}
          onClick={() => setActiveTab('js')}
        >
          ⚡ script.js
        </button>
        <button 
          className={`tab-btn preview-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          🌐 Live Preview
        </button>
      </div>
      
      <div className="editor-preview-container">
        {activeTab === 'preview' ? (
          <LivePreview html={html} css={css} js={js} />
        ) : (
          <Editor
            height="500px"
            language={getLanguage()}
            value={getEditorContent()}
            onChange={(value) => handleCodeChange(value, activeTab)}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              automaticLayout: true,
              wordWrap: 'on'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MultiLanguageEditor;