// auth-api.js - Authentication API calls

import { setAuthToken, getAuthToken } from './auth-storage.js';

const API_BASE_URL = 'http://localhost:3000';

export async function loginUser(email, password) {
  const apiEndpoint = `${API_BASE_URL}/auth/login`;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Login failed: ${text}`);
  }

  const result = await response.json();
  
  if (result.token) {
    await setAuthToken(result.token);
  }

  return result;
}

export async function buildAuthHeadersWithToken() {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}
