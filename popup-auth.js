import { getAuthToken, clearAuthToken } from './auth-storage.js';
import { loginUser } from './auth-api.js';
import { showAuthSection, showMainSection } from './popup-view.js';

export function initAuthHandlers({ onAuthenticated }) {
  const loginButton = document.getElementById('login-btn');
  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const statusDiv = document.getElementById('auth-status');

      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value || '';

      if (!email || !password) {
        if (statusDiv) {
          statusDiv.textContent = 'Please enter email and password.';
          statusDiv.className = 'error';
        }
        return;
      }

      if (statusDiv) {
        statusDiv.textContent = 'Logging in...';
        statusDiv.className = 'loading';
      }
      loginButton.disabled = true;

      try {
        await loginUser(email, password);
        if (statusDiv) {
          statusDiv.textContent = '✓ Logged in successfully!';
          statusDiv.className = 'success';
        }
        if (emailInput) {
          emailInput.value = '';
        }
        if (passwordInput) {
          passwordInput.value = '';
        }

        showMainSection();
        if (onAuthenticated) {
          await onAuthenticated();
        }
      } catch (error) {
        if (statusDiv) {
          statusDiv.textContent = `Error: ${error.message}`;
          statusDiv.className = 'error';
        }
      } finally {
        loginButton.disabled = false;
      }
    });
  }

  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      await clearAuthToken();
      showAuthSection();
    });
  }

  const signupLinkButton = document.getElementById('signup-link-btn');
  if (signupLinkButton) {
    signupLinkButton.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:5173/signup' });
    });
  }
}

export async function checkAuth({ onAuthenticated }) {
  const token = await getAuthToken();
  if (token) {
    showMainSection();
    if (onAuthenticated) {
      await onAuthenticated();
    }
  } else {
    showAuthSection();
  }
}
