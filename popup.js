// popup.js - Main popup logic

import { showStatus } from './utils.js';
import { sendProfiles } from './api.js';
import { extractFunc } from './extractor.js';

document.getElementById('open-talinem').addEventListener('click', async () => {
  try {
    await chrome.tabs.create({ url: 'https://talinem.com' });
  } catch (error) {
    console.error(error);
    showStatus(`Error: ${error.message}`, 'error');
  }
});

document.getElementById('extract').addEventListener('click', async () => {
  const apiEndpoint = 'http://localhost:3000/extract';
  const countInput = document.getElementById('count');
  const maxCount = Math.max(1, parseInt(countInput.value, 10) || 100);

  showStatus('Extracting profiles...', 'loading');
  document.getElementById('extract').disabled = true;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFunc,
      args: [maxCount]
    });

    const profiles = result?.result || [];

    if (!profiles.length) {
      showStatus('No profiles found. Scroll down and try again.', 'error');
      document.getElementById('extract').disabled = false;
      return;
    }

    showStatus(`Sending ${profiles.length} profiles...`, 'loading');

    const sentCount = await sendProfiles(profiles, apiEndpoint);

    showStatus(`✓ Sent ${sentCount} profiles`, 'success');

  } catch (error) {
    console.error(error);
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    document.getElementById('extract').disabled = false;
  }
});