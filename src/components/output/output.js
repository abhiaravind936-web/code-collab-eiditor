import React, { useState } from 'react';

const Output = ({ code }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);

  const executeJavaScript = (codeToRun) => {
    // Capture console.log
    const originalLog = console.log;
    let logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      // eslint-disable-next-line no-eval
      const result = eval(codeToRun);
      if (result !== undefined) {
        logs.push(`→ ${result}`);
      }
      setOutput(logs.join('\n'));
      setError('');
    } catch (err) {
      setError(err.message);
      setOutput('');
    } finally {
      console.log = originalLog;
    }
  };

  const executePython = async (codeToRun) => {
    setIsLoading(true);
    setOutput('');
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/execute/python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeToRun }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setOutput('');
      } else {
        setOutput(data.output);
        setError('');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const runCode = () => {
    if (language === 'javascript') {
      executeJavaScript(code);
    } else if (language === 'python') {
      executePython(code);
    }
  };

  return (
    <div style={{ height: '250px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
        {/* Language Selector Dropdown */}
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          <option value="javascript">🟨 JavaScript</option>
          <option value="python">🐍 Python</option>
        </select>
        
        {/* Run Button */}
        <button 
          onClick={runCode}
          disabled={isLoading}
          style={{
            padding: '8px 24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳ Running...' : '▶ Run Code'}
        </button>
        
        {/* Language Info */}
        <span style={{ fontSize: '12px', color: '#666' }}>
          {language === 'javascript' ? '⚡ Runs in browser' : '🐍 Runs on server'}
        </span>
      </div>
      
      {/* Output Display */}
      <div style={{
        flex: 1,
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '12px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        overflow: 'auto',
        fontSize: '13px'
      }}>
        {isLoading ? (
          <div style={{ color: '#4CAF50' }}>⏳ Executing Python code...</div>
        ) : error ? (
          <pre style={{ color: '#f48771', margin: 0, whiteSpace: 'pre-wrap' }}>❌ Error: {error}</pre>
        ) : output ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
        ) : (
          <span style={{ color: '#858585' }}>
            ✨ Select language and click "Run Code" to execute...
          </span>
        )}
      </div>
    </div>
  );
};

export default Output;