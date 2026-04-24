// api.js - Functions for API communication

export async function getListProspects() {
  const apiEndpoint = 'http://localhost:3000/listprospects';

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
  const apiEndpoint = 'http://localhost:3000/listprospects';

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