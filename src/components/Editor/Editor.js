import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, readOnly = false }) => {
  const [language, setLanguage] = useState('javascript');

  const getDefaultCode = (lang) => {
    switch(lang) {
      case 'javascript':
        return '// JavaScript Example\nconsole.log("Hello World!");\n\n// Try a function\nfunction add(a, b) {\n  return a + b;\n}\nconsole.log(add(5, 3));';
      
      case 'python':
        return '# Python Example\nprint("Hello World!")\n\n# Try a function\ndef add(a, b):\n    return a + b\nprint(add(5, 3))\n\n# Try a loop\nfor i in range(5):\n    print(f"Number: {i}")';
      
      case 'java':
        return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World from Java! ☕");
        
        // Try a function
        int result = add(5, 3);
        System.out.println("5 + 3 = " + result);
        
        // Try a loop
        for (int i = 1; i <= 5; i++) {
            System.out.println("Number: " + i);
        }
    }
    
    public static int add(int a, int b) {
        return a + b;
    }
}`;
      
      default:
        return code;
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <option value="javascript">🟨 JavaScript</option>
          <option value="python">🐍 Python</option>
          <option value="java">☕ Java</option>
        </select>
        <span style={{ fontSize: '12px', color: '#666' }}>
          💡 Language affects syntax highlighting only
        </span>
        <span style={{ fontSize: '11px', color: '#4CAF50' }}>
          {language === 'java' && '⚠️ Java code must have public class Main'}
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
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;