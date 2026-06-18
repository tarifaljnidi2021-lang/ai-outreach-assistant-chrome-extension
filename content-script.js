// content-script.js - Handles communication between page context and extension

// Listen for progress messages from injected scripts
window.addEventListener('message', (event) => {
  // Only accept messages from this window
  if (event.source !== window) return;

  // Check for progress messages
  if (event.data?.type === 'EXTRACTION_PROGRESS') {
    console.log('📨 Content script received progress:', event.data);

    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
      chrome.runtime.sendMessage(
        {
          type: 'EXTRACTION_PROGRESS',
          current: event.data.current,
          total: event.data.total,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Content->Background sendMessage error:', chrome.runtime.lastError);
          } else {
            console.log('Content->Background response:', response);
          }
        }
      );
    } else {
      console.warn('chrome.runtime.sendMessage is unavailable in content script; progress will not be relayed.');
    }
  }
});

console.log('✅ Content script loaded and listening for extraction progress');
