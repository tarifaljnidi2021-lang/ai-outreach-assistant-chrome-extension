import { showStatus } from './utils.js';

export async function initMainActionHandlers() {
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
    let statusInterval = null;

    const stopStatusPolling = () => {
      if (statusInterval) {
        clearInterval(statusInterval);
        statusInterval = null;
      }
    };

    const startStatusPolling = () => {
      stopStatusPolling();
      statusInterval = setInterval(async () => {
        try {
          const response = await chrome.runtime.sendMessage({ type: 'GET_EXTRACTION_STATUS' });
          if (!response?.active) {
            stopStatusPolling();
            extractButton.disabled = false;
            // Load and clear last success status if available
            const { lastStatus } = await chrome.storage.local.get('lastStatus');
            if (lastStatus) {
              showStatus(lastStatus.message, lastStatus.type);
              await chrome.storage.local.remove('lastStatus');
            }
          }
        } catch (error) {
          console.error('Polling failed:', error);
          stopStatusPolling();
          extractButton.disabled = false;
        }
      }, 1000);
    };

    const checkExtractionStatus = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_EXTRACTION_STATUS' });
        if (response?.active) {
          showStatus('Extraction still running in background...', 'loading');
          extractButton.disabled = true;
          startStatusPolling();
        } else {
          extractButton.disabled = false;
          // Load and clear last success status if available
          const { lastStatus } = await chrome.storage.local.get('lastStatus');
          if (lastStatus) {
            showStatus(lastStatus.message, lastStatus.type);
            await chrome.storage.local.remove('lastStatus');
          }
        }
      } catch (error) {
        console.error('Failed to get extraction status:', error);
        extractButton.disabled = false;
      }
    };

    await checkExtractionStatus();

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

      showStatus('Extraction started in background...', 'loading');
      extractButton.disabled = true;
      stopStatusPolling();
      // Clear last status when starting new extraction
      await chrome.storage.local.remove('lastStatus');

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'START_EXTRACTION',
          maxCount,
          selectedListId,
          apiEndpoint,
        });

        if (!response?.success) {
          throw new Error(response?.error || 'Extraction failed');
        }

        const successMessage = `✓ Sent ${response.sentCount} profiles for ${selectedListId}`;
        showStatus(successMessage, 'success');
      } catch (error) {
        console.error(error);
        showStatus(`Error: ${error.message}`, 'error');
      } finally {
        extractButton.disabled = false;
      }
    });
  }
}
