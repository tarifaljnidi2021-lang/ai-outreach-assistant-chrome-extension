import { extractFunc } from './extractor.js';
import { sendProfiles } from './api.js';

const extractionState = {
  active: false,
  current: 0,
  total: 0,
};

async function performExtraction({ maxCount, selectedListId, apiEndpoint }) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('Unable to find the active tab.');
  }

  extractionState.active = true;
  extractionState.current = 0;
  extractionState.total = maxCount;

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFunc,
      args: [maxCount],
    });

    const profiles = result?.result || [];
    if (!profiles.length) {
      throw new Error('No profiles extracted. Scroll down and try again.');
    }

    const sentCount = await sendProfiles(profiles, apiEndpoint, selectedListId);
    const successMessage = `✓ Sent ${sentCount} profiles for ${selectedListId}`;
    // Store the success status
    await chrome.storage.local.set({ lastStatus: { message: successMessage, type: 'success' } });
    return { extractedCount: profiles.length, sentCount };
  } finally {
    extractionState.active = false;
    extractionState.current = 0;
    extractionState.total = 0;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) {
    return false;
  }

  if (message.type === 'START_EXTRACTION') {
    performExtraction(message)
      .then((payload) => {
        sendResponse({ success: true, ...payload });
      })
      .catch((error) => {
        console.error('Extraction failed:', error);
        sendResponse({ success: false, error: error.message || String(error) });
      });

    return true;
  }

  if (message.type === 'GET_EXTRACTION_STATUS') {
    sendResponse({
      active: extractionState.active,
      current: extractionState.current,
      total: extractionState.total,
    });
    return true;
  }

  if (message.type === 'EXTRACTION_PROGRESS') {
    console.log('📊 Progress update received:', message.current, '/', message.total);
    extractionState.current = message.current;
    extractionState.total = message.total;
    sendResponse({ received: true });
    return true;
  }

  return false;
});
