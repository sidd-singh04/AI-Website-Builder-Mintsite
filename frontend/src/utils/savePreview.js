export function safePreview(html) {
  if (!html) return "";
  
  let processed = html;
  
  // 1. Ensure all links inside the iframe open in a new tab so they don't break the iframe/app navigation
  processed = processed.replace(/<a\s+(?!.*?target=)[^>]*>/gi, (match) => {
    return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
  });
  
  // 2. Add safe scrollbar/reset styles to body if not already present
  if (processed.includes('</head>')) {
    const customStyle = `
      <style>
        /* Smooth scrolling and styled scrollbars inside iframe */
        html {
          scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f0f12;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a35;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f4e;
        }
      </style>
    `;
    processed = processed.replace('</head>', `${customStyle}</head>`);
  }
  
  return processed;
}
