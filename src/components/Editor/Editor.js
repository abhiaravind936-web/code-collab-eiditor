import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, readOnly = false }) => {
  const [language, setLanguage] = useState('javascript');

  // Default code templates for different languages
  const getDefaultCode = (lang) => {
    switch(lang) {
      case 'javascript':
        return '// JavaScript Example\nconsole.log("Hello World!");\n\n// Try a function\nfunction add(a, b) {\n  return a + b;\n}\nconsole.log(add(5, 3));';
      case 'python':
        return '# Python Example\nprint("Hello World!")\n\n# Try a function\ndef add(a, b):\n    return a + b\nprint(add(5, 3))\n\n# Try a loop\nfor i in range(5):\n    print(f"Number: {i}")';
      default:
        return code;
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Optional: Reset code to default template for that language
    // onChange(getDefaultCode(newLanguage));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
        <select 
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            padding: '6px 12px',
            background: '#2d2d2d',
            color: 'white',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <span style={{ fontSize: '12px', color: '#666' }}>
          💡 Language affects syntax highlighting only
        </span>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => onChange(value)}
          theme="vs-dark"
          options={{
            readOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            tabSize: 2,
            automaticLayout: true,
            scrollBeyondLastLine: false
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;