// session-sync.js - Handles session context synchronization for LinkedIn cookies

import { saveSessionContext } from './api.js';

const LINKEDIN_DOMAIN = 'linkedin.com';
const LINKEDIN_COOKIE_NAMES = new Set([
  'li_at',
  'JSESSIONID',
  'li_rm',
  'bcookie',
  'bscookie',
  'lidc'
]);

function isLinkedInCookie(changeInfo) {
  const { cookie } = changeInfo;
  return cookie &&
    typeof cookie.name === 'string' && LINKEDIN_COOKIE_NAMES.has(cookie.name) &&
    typeof cookie.domain === 'string' && cookie.domain.includes(LINKEDIN_DOMAIN);
}

export function registerSessionSyncWorker() {
  // Listen for LinkedIn cookie changes
  chrome.cookies.onChanged.addListener(async (changeInfo) => {
    if (isLinkedInCookie(changeInfo)) {
      try {
        await saveSessionContext();
        console.log('[SessionSync] Synced session context due to cookie change.');
      } catch (err) {
        console.warn('[SessionSync] Failed to sync session context:', err);
      }
    }
  });

  // Periodic sync 
  const SYNC_INTERVAL_MS =  60 * 1000;
  setInterval(async () => {
    try {
      await saveSessionContext();
      console.log('[SessionSync] Periodic session context sync.');
    } catch (err) {
      console.warn('[SessionSync] Periodic sync failed:', err);
    }
  }, SYNC_INTERVAL_MS);

  // Initial sync on extension load
  (async () => {
    try {
      await saveSessionContext();
      console.log('[SessionSync] Initial session context sync.');
    } catch (err) {
      console.warn('[SessionSync] Initial sync failed:', err);
    }
  })();
}
