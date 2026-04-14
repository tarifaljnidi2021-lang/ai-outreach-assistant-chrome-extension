// api.js - Functions for API communication

export async function sendProfiles(profiles, apiEndpoint) {
  const payload = {
    count: profiles.length,
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