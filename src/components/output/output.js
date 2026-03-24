import React, { useState } from 'react';

const Output = ({ code }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const runCode = () => {
    setOutput('');
    setError('');
    
    // Capture console.log
    const originalLog = console.log;
    let logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      // eslint-disable-next-line no-eval
      const result = eval(code);
      if (result !== undefined) {
        logs.push(`→ ${result}`);
      }
      setOutput(logs.join('\n'));
    } catch (err) {
      setError(err.message);
    } finally {
      console.log = originalLog;
    }
  };

  return (
    <div style={{ height: '200px', display: 'flex', flexDirection: 'column' }}>
      <button 
        onClick={runCode}
        style={{
          padding: '8px 16px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px',
          alignSelf: 'flex-start',
          fontWeight: 'bold'
        }}
      >
        ▶ Run Code
      </button>
      
      <div style={{
        flex: 1,
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        overflow: 'auto',
        fontSize: '13px'
      }}>
        {error ? (
          <pre style={{ color: '#f48771', margin: 0 }}>❌ Error: {error}</pre>
        ) : output ? (
          <pre style={{ margin: 0 }}>{output}</pre>
        ) : (
          <span style={{ color: '#858585' }}>✨ Click "Run Code" to execute JavaScript...</span>
        )}
      </div>
    </div>
  );
};

export default Output;