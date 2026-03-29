import React, { useState, useEffect } from 'react';

const LivePreview = ({ html, css, js }) => {
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    // Combine HTML, CSS, and JS into a complete HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Reset for preview */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            padding: 20px;
          }
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Error catching for JavaScript
          window.onerror = function(msg, url, line, col, error) {
            console.error('JavaScript Error:', msg, 'at line', line);
            return false;
          };
          
          ${js}
        </script>
      </body>
      </html>
    `;
    setPreviewContent(fullHtml);
  }, [html, css, js]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '8px 12px',
        background: '#2d2d2d',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🌐 Live Preview</span>
        <span style={{ fontSize: '11px', color: '#888' }}>
          HTML + CSS + JavaScript
        </span>
      </div>
      <iframe
        srcDoc={previewContent}
        title="live-preview"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'white'
        }}
      />
    </div>
  );
};

export default LivePreview;