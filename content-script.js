// content-script.js - Handles communication between page context and extension

// Listen for progress messages from injected scripts
window.addEventListener('message', (event) => {
  // Only accept messages from this window
  if (event.source !== window) return;

  // Check for progress messages
  if (event.data?.type === 'EXTRACTION_PROGRESS') {
    console.log('📨 Content script received progress:', event.data);
    
    // Relay to background script
    chrome.runtime.sendMessage({
      type: 'EXTRACTION_PROGRESS',
      current: event.data.current,
      total: event.data.total
    }).catch(err => {
      console.log('Could not send to background:', err);
    });
  }
});

console.log('✅ Content script loaded and listening for extraction progress');
