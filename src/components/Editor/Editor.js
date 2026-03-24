import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, readOnly = false }) => {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      <Editor
        height="400px"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => onChange(value)}
        theme="vs-dark"
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true
        }}
      />
    </div>
  );
};

export default CodeEditor;