// auth-storage.js - Token management using Chrome storage

let cachedToken = null;

export async function setAuthToken(token) {
  cachedToken = token;
  
  if (!chrome?.storage?.local) {
    console.error('chrome.storage.local is not available');
    return;
  }
  
  try {
    await chrome.storage.local.set({ authToken: token });
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
}

export async function getAuthToken() {
  if (cachedToken) {
    return cachedToken;
  }
  
  if (!chrome?.storage?.local) {
    console.error('chrome.storage.local is not available');
    return null;
  }
  
  try {
    const result = await chrome.storage.local.get('authToken');
    cachedToken = result.authToken || null;
    return cachedToken;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

export async function clearAuthToken() {
  cachedToken = null;
  
  if (!chrome?.storage?.local) {
    console.error('chrome.storage.local is not available');
    return;
  }
  
  try {
    await chrome.storage.local.remove('authToken');
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
}
