// api.js - Functions for API communication

import { getLinkedInCookies } from './linkedin-cookies.js';
import { buildAuthHeadersWithToken } from './auth-api.js';

const API_BASE_URL = 'http://localhost:3000';

export async function buildLinkedInSessionContext() {
  const cookies = await getLinkedInCookies();

  return {
    capturedAt: new Date().toISOString(),
    cookies
  };
}

export async function getListProspects() {
  const apiEndpoint = `${API_BASE_URL}/listprospects`;

  const response = await fetch(apiEndpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${text}`);
  }

  return response.json();
}

export async function createProspectsList(name) {
  const apiEndpoint = `${API_BASE_URL}/listprospects`;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${text}`);
  }

  return response.json();
}

export async function sendProfiles(profiles, apiEndpoint, listId) {
  const payload = {
    count: profiles.length,
    listId,
    profiles
  };

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${text}`);
  }

  return profiles.length;
}

export async function createCampaignWithSession(campaignPayload) {
  const apiEndpoint = `${API_BASE_URL}/campaign`;
  const sessionContext = await buildLinkedInSessionContext();

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: await buildAuthHeadersWithToken(),
    body: JSON.stringify({
      ...campaignPayload,
      sessionContext
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${text}`);
  }

  return response.json();
}