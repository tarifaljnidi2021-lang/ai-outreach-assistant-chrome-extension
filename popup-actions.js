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
    let extractionStartedLocally = false;

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
            if (extractionStartedLocally) {
              // The extraction has been requested, but the background may not be active yet.
              return;
            }
            stopStatusPolling();
            extractButton.disabled = false;
            // Load and clear last success status if available
            const { lastStatus } = await chrome.storage.local.get('lastStatus');
            if (lastStatus) {
              showStatus(lastStatus.message, lastStatus.type);
              await chrome.storage.local.remove('lastStatus');
            }
          } else {
            const listSelect = document.getElementById('list-select');
            const listName = listSelect?.selectedOptions[0]?.text || 'Unknown List';
            const current = response.current || 0;
            const total = response.total || 100;
            const percentage = Math.round((current / total) * 100);
            showStatus(`Extracting for ${listName}: ${current}/${total}`, 'loading', percentage);
          }
        } catch (error) {
          console.error('Polling failed:', error);
          stopStatusPolling();
          extractButton.disabled = false;
        }
      }, 500);
    };

    const checkExtractionStatus = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_EXTRACTION_STATUS' });
        console.log('📊 Status check response:', response);
        if (response?.active) {
          const listSelect = document.getElementById('list-select');
          const listName = listSelect?.selectedOptions[0]?.text || 'Unknown List';
          const current = response.current || 0;
          const total = response.total || 100;
          const percentage = Math.round((current / total) * 100);
          console.log(`📈 Progress: ${current}/${total} (${percentage}%)`);
          showStatus(`Extracting for ${listName}: ${current}/${total}`, 'loading', percentage);
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

      // Check if current URL is on LinkedIn search results page
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url || !tab.url.includes('https://www.linkedin.com/search/results/people/')) {
          showStatus('No prospect to import here. You need to go to a LinkedIn page where there is prospects to import such as a search, a profile, or your connections.', 'error');
          return;
        }
      } catch (error) {
        console.error('Failed to get tab URL:', error);
        showStatus('Unable to verify LinkedIn page.', 'error');
        return;
      }

      const listName = listSelect?.selectedOptions[0]?.text || 'Unknown List';
      showStatus(`Extracting for ${listName}: 0/${maxCount}`, 'loading', 0);
      extractButton.disabled = true;
      extractionStartedLocally = true;
      stopStatusPolling();
      startStatusPolling();
      // Clear last status when starting new extraction
      await chrome.storage.local.remove('lastStatus');

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'START_EXTRACTION',
          maxCount,
          selectedListId,
          listName,
          apiEndpoint,
        });

        if (!response?.success) {
          throw new Error(response?.error || 'Extraction failed');
        }

        const successMessage = `✓ Sent ${response.sentCount} profiles for ${listName}`;
        showStatus(successMessage, 'success');
      } catch (error) {
        console.error(error);
        showStatus(`Error: ${error.message}`, 'error');
      } finally {
        extractionStartedLocally = false;
        extractButton.disabled = false;
      }
    });
  }
}
