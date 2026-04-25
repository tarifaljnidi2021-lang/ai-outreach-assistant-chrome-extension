// popup.js - Bootstrap wiring for popup modules

import { initListManager } from './list-manager.js';
import { loadLists } from './popup-lists.js';
import { initMainActionHandlers } from './popup-actions.js';
import { initAuthHandlers, checkAuth } from './popup-auth.js';

let listManagerInitialized = false;

async function onAuthenticated() {
  if (!listManagerInitialized) {
    initListManager();
    listManagerInitialized = true;
  }
  await loadLists();
}

initAuthHandlers({ onAuthenticated });
initMainActionHandlers();
checkAuth({ onAuthenticated });

