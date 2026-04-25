import { showStatus } from './utils.js';
import { sendProfiles } from './api.js';
import { extractFunc } from './extractor.js';

export function initMainActionHandlers() {
  const openTalinemButton = document.getElementById('open-talinem');
  if (openTalinemButton) {
    openTalinemButton.addEventListener('click', async () => {
      try {
        await chrome.tabs.create({ url: 'https://talinem.com' });
      } catch (error) {
        console.error(error);
        showStatus(`Error: ${error.message}`, 'error');
      }
    });
  }

  const extractButton = document.getElementById('extract');
  if (extractButton) {
    extractButton.addEventListener('click', async () => {
      const apiEndpoint = 'http://localhost:3000/extract';
      const countInput = document.getElementById('count');
      const listSelect = document.getElementById('list-select');
      const selectedListId = listSelect?.value;
      const maxCount = Math.max(1, parseInt(countInput?.value ?? '100', 10) || 100);

      if (!selectedListId) {
        showStatus('Select a list first.', 'error');
        return;
      }

      showStatus('Extracting profiles...', 'loading');
      extractButton.disabled = true;

      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractFunc,
          args: [maxCount],
        });

        const profiles = result?.result || [];

        if (!profiles.length) {
          showStatus('No profiles found. Scroll down and try again.', 'error');
          extractButton.disabled = false;
          return;
        }

        showStatus(`Sending ${profiles.length} profiles...`, 'loading');
        const sentCount = await sendProfiles(profiles, apiEndpoint, selectedListId);
        showStatus(`✓ Sent ${sentCount} profiles`, 'success');
      } catch (error) {
        console.error(error);
        showStatus(`Error: ${error.message}`, 'error');
      } finally {
        extractButton.disabled = false;
      }
    });
  }
}
