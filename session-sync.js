// session-sync.js - Handles session context synchronization for LinkedIn cookies
//
// Uses chrome.alarms instead of setInterval: MV3 service workers are terminated
// after ~30 s of inactivity so any pending setInterval/setTimeout is destroyed.
// chrome.alarms persist across service-worker restarts and are deduplicated by name.
//
// Double-execution prevention:
//   - On first install (no alarm yet) → create alarm + immediate sync.
//   - On SW restart (alarm already exists) → skip immediate sync; the alarm
//     handler will fire at the scheduled time.  Re-running registerSessionSyncWorker
//     does NOT reset the alarm timer.

import { saveSessionContext, getSyncInterval } from './api.js';

const ALARM_NAME = 'session-context-sync';
// Short retry so the alarm stays alive when the backend is temporarily unreachable
// instead of waiting 24 h. Will be replaced by the real value on next successful GET.
const FALLBACK_INTERVAL_MINUTES = 2 * 24 * 60;

async function fetchIntervalMinutes() {
  try {
    const ms = await getSyncInterval(); // GET /session-update-interval
    if (Number.isFinite(ms) && ms > 0) {
      return Math.max(1, ms / 60000);
    }
    console.warn('[SessionSync] Backend returned invalid interval, retrying in', FALLBACK_INTERVAL_MINUTES, 'min.');
  } catch (err) {
    console.warn('[SessionSync] Could not fetch sync interval, retrying in', FALLBACK_INTERVAL_MINUTES, 'min:', err.message);
  }
  return FALLBACK_INTERVAL_MINUTES;
}

// ── alarm listener – registered at module top-level (required for MV3) ───────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  // 1. GET /session-update-interval – always recreate alarm with the latest period
  //    so backend changes take effect on the next cycle.
  //    chrome.alarms uses minutes because that is what the API accepts.
  const periodInMinutes = await fetchIntervalMinutes();
  chrome.alarms.create(ALARM_NAME, { periodInMinutes });

  // 2. POST /session-context
  try {
    await saveSessionContext();
    console.log(`[SessionSync] Periodic session context sync. Next in ${periodInMinutes} min.`);
  } catch (err) {
    console.warn('[SessionSync] Sync failed:', err);
  }
});

// ── public ───────────────────────────────────────────────────────────────────
export async function registerSessionSyncWorker() {
  const existing = await chrome.alarms.get(ALARM_NAME);

  if (!existing) {
    // First install: no alarm yet.
    // 1. GET interval  2. create alarm  3. immediate sync
    const periodInMinutes = await fetchIntervalMinutes();
    chrome.alarms.create(ALARM_NAME, { periodInMinutes });
    console.log(`[SessionSync] Alarm created: every ${periodInMinutes} min.`);

    try {
      await saveSessionContext();
      console.log('[SessionSync] Initial session context sync.');
    } catch (err) {
      console.warn('[SessionSync] Initial sync failed:', err);
    }
  } else {
    // SW restarted: alarm is already running — do NOT sync again here.
    // The alarm handler will fire at the originally scheduled time.
    console.log(`[SessionSync] SW restarted. Alarm already running (next in ${Math.round((existing.scheduledTime - Date.now()) / 1000)} s).`);
  }
}

